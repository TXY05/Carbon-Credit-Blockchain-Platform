// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IUserRegistry {
    function isBuyer(address user) external view returns (bool);
    function isDeveloper(address user) external view returns (bool);
}

interface IProjectRegistry {
    function isMinted(uint256 projectID) external view returns (bool);
    function getCapacity(
        uint256 projectID
    ) external view returns (uint256 capacity);
    function setMinted(uint256 projectID) external view returns (bool);
    function removeCapacity(
        uint256 projectID,
        uint256 _amount
    ) external view returns (bool);
    function getDeveloper(uint256 projectID) external view returns (address);
    function getPricePerToken(
        uint256 projectID
    ) external view returns (uint256);
}

contract CarbonToken {
    constructor(address _IProjectRegistry, address _IUserRegistry) {
        projectRegistry = IProjectRegistry(_IProjectRegistry);
        userRegistry = IUserRegistry(_IUserRegistry);
    }

    modifier onlyDeveloper() {
        require(userRegistry.isDeveloper(msg.sender), "Only developer");
        _;
    }

    modifier onlyBuyer() {
        require(userRegistry.isBuyer(msg.sender), "Only buyer");
        _;
    }

    uint256 private constant MAX_UINT256 = type(uint256).max;

    mapping(address => mapping(uint256 => uint256)) public projectBalances;
    mapping(address => mapping(address => mapping(uint256 => uint256)))
        public allowed;
    mapping(address => mapping(uint256 => uint256)) public retired;
    mapping(uint256 => uint256) public projectRetired;
    uint256 public totalSupply;
    uint256 public totalMinted;
    uint256 public totalRetired;

    event Transfer(
        uint256 indexed projectID,
        address indexed from,
        address indexed to,
        uint256 value
    );
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 indexed projectID,
        uint256 value
    );
    event TokensPurchased(
        uint256 indexed projectID,
        address indexed buyer,
        address indexed developer,
        uint256 amount,
        uint256 totalPrice
    );

    event TokensRetired(
        address indexed buyer,
        uint256 indexed projectID,
        uint256 amount
    );

    IProjectRegistry public projectRegistry;
    IUserRegistry public userRegistry;

    function mintTokens(
        uint256 projectID
    ) external onlyDeveloper returns (bool) {
        require(
            projectRegistry.getDeveloper(projectID) == msg.sender,
            "Not project developer"
        );

        require(!projectRegistry.isMinted(projectID), "Project is minted");

        uint256 capacity = projectRegistry.getCapacity(projectID);

        require(capacity > 0, "No capacity");

        projectBalances[msg.sender][projectID] += capacity;

        totalSupply += capacity;
        totalMinted += capacity;

        projectRegistry.setMinted(projectID);

        emit Transfer(projectID, address(0), msg.sender, capacity);

        return true;
    }

    function balanceOf(
        address user,
        uint256 projectID
    ) external view returns (uint256) {
        return projectBalances[user][projectID];
    }

    function transfer(
        uint256 projectID,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            projectBalances[msg.sender][projectID] >= _value,
            "token balance is lower than the value requested"
        );
        require(_to != address(0), "Invalid recipient");
        require(_value > 0, "Amount must be greater than zero");
        projectBalances[msg.sender][projectID] -= _value;
        projectBalances[_to][projectID] += _value;
        emit Transfer(projectID, msg.sender, _to, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value,
        uint256 projectID
    ) public returns (bool success) {
        uint256 allowances = allowed[_from][msg.sender][projectID];
        require(
            projectBalances[_from][projectID] >= _value && allowances >= _value,
            "token balance or allowance is lower than amount requested"
        );
        require(_to != address(0), "Invalid recipient");
        require(_value > 0, "Amount must be greater than zero");

        projectBalances[_to][projectID] += _value;
        projectBalances[_from][projectID] -= _value;
        if (allowances < MAX_UINT256) {
            allowed[_from][msg.sender][projectID] -= _value;
        }
        emit Transfer(projectID, _from, _to, _value);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value,
        uint256 projectID
    ) public returns (bool success) {
        require(_spender != address(0), "Invalid recipient");

        allowed[msg.sender][_spender][projectID] = _value;
        emit Approval(msg.sender, _spender, projectID, _value);
        return true;
    }

    function allowance(
        address _owner,
        address _spender,
        uint256 projectID
    ) public view returns (uint256 remaining) {
        return allowed[_owner][_spender][projectID];
    }

    function purchaseCredits(
        uint256 projectID,
        uint256 amount
    ) external payable onlyBuyer returns (bool) {
        require(amount > 0, "Amount must be greater than zero");

        require(projectRegistry.isMinted(projectID), "Project is not minted");

        require(
            projectRegistry.getCapacity(projectID) >= amount,
            "Not enough tokens"
        );

        address developer = projectRegistry.getDeveloper(projectID);

        require(developer != address(0), "Invalid developer");
        require(
            projectBalances[developer][projectID] >= amount,
            "Developer has insufficient tokens"
        );

        uint256 pricePerToken = projectRegistry.getPricePerToken(projectID);
        uint256 totalPrice = amount * pricePerToken;

        require(msg.value == totalPrice, "Incorrect ETH amount");

        projectBalances[developer][projectID] -= amount;
        projectBalances[msg.sender][projectID] += amount;

        projectRegistry.removeCapacity(projectID, amount);

        emit TokensPurchased(
            projectID,
            msg.sender,
            developer,
            amount,
            totalPrice
        );

        emit Transfer(projectID, developer, msg.sender, amount);

        (bool success, ) = payable(developer).call{value: msg.value}("");

        require(success, "ETH transfer failed");

        return true;
    }

    function retire(
        uint256 projectID,
        uint256 amount
    ) external onlyBuyer returns (bool) {
        require(amount > 0, "Amount must be greater than zero");
        require(
            projectBalances[msg.sender][projectID] >= amount,
            "Insufficient balance"
        );

        projectBalances[msg.sender][projectID] -= amount;
        retired[msg.sender][projectID] += amount;
        projectRetired[projectID] += amount;
        totalSupply -= amount;
        totalRetired += amount;
        emit TokensRetired(msg.sender, projectID, amount);
        emit Transfer(projectID, msg.sender, address(0), amount);
        return true;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IProjectRegistry {
    function isMinted(uint256 projectID) external view returns (bool);
    function getCapacity(
        uint256 projectID
    ) external view returns (uint256 capacity);
    function setMinted(uint256 projectID) external view returns (bool);
    function removeCapacity(uint256 projectID,uint256 _amount) external view returns (bool);
}

contract CarbonToken {
    constructor(address _IProjectRegistry) {
        projectRegistry = IProjectRegistry(_IProjectRegistry);
    }

    uint256 private constant MAX_UINT256 = 2 ** 256 - 1;

    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowed;
    uint256 public totalSupply;
    uint256 public allowances;

    event Transfer(address from, address to, uint256 value);
    event Approval(address from, address to, uint256 value);

    IProjectRegistry public projectRegistry;

    function mintTokens(uint256 projectID, address to) public returns (bool) {
        require(
            projectRegistry.isMinted(projectID) != true,
            "Project is minted!"
        );

        uint256 capacity = projectRegistry.getCapacity(projectID);

        balances[to] += capacity;
        totalSupply += capacity;
        projectRegistry.setMinted(projectID);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            balances[msg.sender] >= _value,
            "token balance is lower than the value requested"
        );
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        allowances = allowed[_from][msg.sender];
        require(
            balances[_from] >= _value && allowances >= _value,
            "token balance or allowance is lower than amount requested"
        );
        balances[_to] += _value;
        balances[_from] -= _value;
        if (allowances < MAX_UINT256) {
            allowed[_from][msg.sender] -= _value;
        }
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function purchaseCredits(uint256 projectID, uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(
            projectRegistry.getCapacity(projectID) >= _amount,
            "Token is not enough!"
        );

        balances[msg.sender] += _amount;
        projectRegistry.removeCapacity(projectID,_amount);

        emit Transfer(address(0), msg.sender, _amount);
    }

    function transferCredits(address _to, uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
    }
}

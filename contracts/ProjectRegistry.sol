// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IUserRegistry {
    function isBuyer(address user) external view returns (bool);
    function isDeveloper(address user) external view returns (bool);
}

contract ProjectRegistry {
    uint256 public constant TONNES_PER_TOKEN = 1;
    IUserRegistry public userRegistry;

    constructor(address _userRegistry) {
        require(_userRegistry != address(0), "Invalid user registry");

        owner = msg.sender;
        userRegistry = IUserRegistry(_userRegistry);
    }

    modifier onlyDeveloper() {
        require(userRegistry.isDeveloper(msg.sender), "Only developer");
        _;
    }

    modifier onlyBuyer() {
        require(userRegistry.isBuyer(msg.sender), "Only buyer");
        _;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "User is not owner");
        _;
    }

    struct Project {
        uint256 projectID;
        address developer;
        string projectName;
        string location;
        string ecosystemType;
        uint256 pricePerToken;
        uint256 capacity;
        uint256 totalSupply;
        uint256 auditDeadline;
        bool minted;
    }

    mapping(uint256 => Project) public projects;

    address public owner;

    event ProjectCreated(
        uint256 indexed projectID,
        address indexed developer,
        string projectName
    );
    event ProjectMinted(uint256 indexed projectID);

    modifier projectExists(uint256 projectID) {
        require(projects[projectID].projectID != 0, "Project does not exist");
        _;
    }

    modifier projectDeveloper(uint256 projectID) {
        require(
            projects[projectID].developer == msg.sender,
            "Not project developer"
        );
        _;
    }

    function createProject(
        uint256 projectID,
        string calldata projectName,
        string calldata location,
        string calldata ecosystemType,
        uint256 pricePerToken,
        uint256 capacity,
        uint256 totalSupply,
        uint256 auditDeadline
    ) external onlyDeveloper returns (bool) {
        require(projectID != 0, "Invalid project ID");
        require(projects[projectID].projectID == 0, "Project already exists");
        require(bytes(projectName).length > 0, "Invalid project name");
        require(bytes(location).length > 0, "Invalid location");
        require(pricePerToken > 0, "Invalid price");
        require(capacity > 0, "Invalid capacity");
        require(totalSupply > 0, "Invalid total supply");
        projects[projectID] = Project({
            projectID: projectID,
            developer: msg.sender,
            projectName: projectName,
            location: location,
            ecosystemType: ecosystemType,
            pricePerToken: pricePerToken,
            capacity: capacity,
            totalSupply: totalSupply,
            auditDeadline: auditDeadline,
            minted: false
        });
        emit ProjectCreated(projectID, msg.sender, projectName);
        return true;
    }

    function isMinted(
        uint256 projectID
    ) public view onlyDeveloper returns (bool mintStatus) {
        return projects[projectID].minted == true;
    }

    function getCapacity(
        uint256 projectID
    ) public view returns (uint256 capacity) {
        return projects[projectID].capacity;
    }

    function setMinted(uint256 projectID) internal {
        projects[projectID].minted = true;
    }

    function reduceAvailableCapacity(uint256 projectID, uint256 amount) internal {
        require(
            projects[projectID].capacity >= amount,
            "Insufficient capacity"
        );

        projects[projectID].capacity -= amount;
    }

    function getDeveloper(uint256 projectID) external view returns (address) {
        return projects[projectID].developer;
    }

    function getPricePerToken(
        uint256 projectID
    ) external view returns (uint256) {
        return projects[projectID].pricePerToken;
    }
}

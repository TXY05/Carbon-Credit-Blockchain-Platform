// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IUserRegistry {
    function isDeveloper(address user) external view returns (bool);
    function isAdmin(address user) external view returns (bool);
}

contract ProjectRegistry {
    uint256 public constant TONNES_PER_TOKEN = 1;

    IUserRegistry public userRegistry;
    address public carbonToken;
    address public owner;

    struct Project {
        uint256 projectID;
        address developer;
        string projectName;
        string location;
        string ecosystemType;
        uint256 pricePerToken;
        uint256 availableCapacity;
        bool minted;
    }

    mapping(uint256 => Project) public projects;
    uint256[] public projectIDs;

    modifier onlyDeveloper() {
        require(userRegistry.isDeveloper(msg.sender), "Only developer");
        _;
    }

    modifier onlyAdmin() {
        require(userRegistry.isAdmin(msg.sender), "Only admin");
        _;
    }

    modifier onlyCarbonToken() {
        require(msg.sender == carbonToken, "Only CarbonToken");
        _;
    }

    modifier projectExists(uint256 projectID) {
        require(projects[projectID].projectID != 0, "Project does not exist");
        _;
    }

    event ProjectCreated(
        uint256 indexed projectID,
        address indexed developer,
        string projectName
    );

    event ProjectMinted(uint256 indexed projectID);

    constructor(address _userRegistry) {
        require(_userRegistry != address(0), "Invalid user registry");

        owner = msg.sender;
        userRegistry = IUserRegistry(_userRegistry);
    }

    function createProject(
        uint256 projectID,
        string calldata projectName,
        string calldata location,
        string calldata ecosystemType,
        uint256 pricePerToken,
        uint256 availableCapacity
    ) external onlyDeveloper returns (bool) {
        require(projectID != 0, "Invalid project ID");

        require(projects[projectID].projectID == 0, "Project already exists");

        require(bytes(projectName).length > 0, "Invalid project name");

        require(bytes(location).length > 0, "Invalid location");

        require(bytes(ecosystemType).length > 0, "Invalid ecosystem type");

        require(pricePerToken > 0, "Invalid price");

        require(availableCapacity > 0, "Invalid capacity");

        projects[projectID] = Project({
            projectID: projectID,
            developer: msg.sender,
            projectName: projectName,
            location: location,
            ecosystemType: ecosystemType,
            pricePerToken: pricePerToken,
            availableCapacity: availableCapacity,
            minted: false
        });

        projectIDs.push(projectID);

        emit ProjectCreated(projectID, msg.sender, projectName);

        return true;
    }

    function getAllProjects() external view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projectIDs.length);

        for (uint256 i = 0; i < projectIDs.length; i++) {
            allProjects[i] = projects[projectIDs[i]];
        }

        return allProjects;
    }

    function getProjectCount() external view returns (uint256) {
        return projectIDs.length;
    }

    function isMinted(
        uint256 projectID
    ) external view projectExists(projectID) returns (bool) {
        return projects[projectID].minted;
    }

    function getCapacity(
        uint256 projectID
    ) external view projectExists(projectID) returns (uint256) {
        return projects[projectID].availableCapacity;
    }

    function setMinted(
        uint256 projectID
    ) external onlyCarbonToken projectExists(projectID) {
        require(!projects[projectID].minted, "Project already minted");

        projects[projectID].minted = true;

        emit ProjectMinted(projectID);
    }

    function reduceAvailableCapacity(
        uint256 projectID,
        uint256 amount
    ) external onlyCarbonToken projectExists(projectID) {
        require(amount > 0, "Invalid amount");

        require(
            projects[projectID].availableCapacity >= amount,
            "Insufficient capacity"
        );

        projects[projectID].availableCapacity -= amount;
    }

    function getDeveloper(
        uint256 projectID
    ) external view projectExists(projectID) returns (address) {
        return projects[projectID].developer;
    }

    function getPricePerToken(
        uint256 projectID
    ) external view projectExists(projectID) returns (uint256) {
        return projects[projectID].pricePerToken;
    }

    function setCarbonToken(address _carbonToken) external onlyAdmin {
        require(_carbonToken != address(0), "Invalid CarbonToken");

        require(carbonToken == address(0), "Already set");

        carbonToken = _carbonToken;
    }
}

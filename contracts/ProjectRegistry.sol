// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProjectRegistry {
    constructor() {
        owner = msg.sender;
    }

    struct Project {
        uint256 projectID;
        string projectName;
        uint256 capacity;
        uint256 totalSupply;
        bool minted;
        Status status;
    }

    enum Status {
        Pending,
        Verified,
        Suspended,
        Expired
    }

    mapping(uint256 => Project) public projects;
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "User is not owner");
        _;
    }

    function isMinted(uint256 projectID) public view returns (bool mintStatus) {
        return projects[projectID].minted == true;
    }

    function getCapacity(
        uint256 projectID
    ) public view returns (uint256 capacity) {
        return projects[projectID].capacity;
    }

    function setMinted(uint256 projectID) public returns (bool) {
        projects[projectID].minted = true;
        return true;
    }

    function removeCapacity(uint256 projectID,uint256 _amount) public returns (bool){
        projects[projectID].capacity -= _amount;
        return true;
    }

}

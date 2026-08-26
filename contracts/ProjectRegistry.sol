// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProjectRegistry {
    struct Project {
        uint256 projectID;
        string projectName;
        uint256 capacity;
        uint256 totalSupply;
        bool minted;
    }

    mapping(uint256 => Project) public projects;

    function isMinted(uint256 projectID) public view returns (bool mintStatus) {
        return projects[projectID].minted == true;
    }

    function getCapacity(uint256 projectID) public view returns (uint256 capacity){
        return projects[projectID].capacity;
    }
}

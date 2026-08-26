// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IUserRegistry {
    function isApprovedUser(address user) external view returns (bool);
}

contract BlueCarbonMarket {
    struct Project {
        string name;
        uint256 startDate;
        string location;
        string country;
        string projectType;
        uint256 auditDeadline;
        Status status;
        address verifier;
        address owner;
        uint256 projectID;
        uint256 totalCarbon;
        uint256 totalCredits;
        uint256 availableCredit;
        uint256 createdAt;
    }

    enum Status {
        Pending,
        Verified,
        Suspended,
        Expired
    }

    struct tradeHistory {
        uint256 price;
        address buyer;
        address seller;
        uint256 timestamp;
        uint256 projectID;
        uint256 amount;
        uint256 tokenID;
    }

    IUserRegistry public userRegistry;
    address public owner;

    constructor() {
       owner = msg.sender;
    }

    


    
    

}

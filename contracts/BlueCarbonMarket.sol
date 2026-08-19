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

    constructor(address _userRegistry) {
        userRegistry = IUserRegistry(_userRegistry);
    }

    
    modifier onlyApprovedUser() {
    require(userRegistry.isApprovedUser(msg.sender),
        "User is not approved");
    _;
}

    function purchaseCredits(uint256 _amount) public onlyApprovedUser {
        require(_amount > 0, "Amount must be greater than zero");
    }

    function transferCredits(
    address _to,
    uint256 _amount
    ) public onlyApprovedUser {
        require(
            userRegistry.isApprovedUser(_to),
            "Recipient is not approved"
        );

        require(_amount > 0, "Amount must be greater than zero");
        
    }
}

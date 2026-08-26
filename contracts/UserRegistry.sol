// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistry {
    address public admin;

    struct Buyer {
        UserRole role;
        string firstName;
        string lastName;
        string email;
        string phoneNumber;
        string country;
        UserStatus status;
    }

    enum UserStatus {
        None,
        Pending,
        Approved,
        Rejected
    }

    enum UserRole {
        Buyer,
        Developer,
        Admin
    }

    mapping(address => Buyer) public buyers;

    event RegistrationRequested(address indexed user);
    event UserApproved(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function purchaseTokens(uint256 _amount) public {}

    function registerUser(
        UserRole _role,
        string memory _firstName,
        string memory _lastName,
        string memory _email,
        string memory _phoneNumber,
        string memory _country
    ) public {
        require(
            buyers[msg.sender].status != UserStatus.Pending,
            "Registration already pending"
        );

        require(
            buyers[msg.sender].status != UserStatus.Approved,
            "User already approved"
        );

        buyers[msg.sender] = Buyer({
            role: _role,
            firstName: _firstName,
            lastName: _lastName,
            email: _email,
            phoneNumber: _phoneNumber,
            country: _country,
            status: UserStatus.Pending
        });

        emit RegistrationRequested(msg.sender);
    }

    function isApprovedUser(address user) external view returns (bool) {
        return buyers[user].status == UserStatus.Approved;
    }

    function isBuyer(address user) external view returns (bool) {
        return buyers[user].role == UserRole.Buyer;
    }

    function isDeveloper(address user) external view returns (bool) {
        return buyers[user].role == UserRole.Developer;
    }


    function approveUser(address _user) public onlyAdmin {
        require(
            buyers[_user].status == UserStatus.Pending,
            "User is not pending approval"
        );
        buyers[_user].status = UserStatus.Approved;
        emit UserApproved(_user);
    }

    function rejectUser(address _user) public onlyAdmin {
        require(
            buyers[_user].status == UserStatus.Pending,
            "User is not pending approval"
        );
        buyers[_user].status = UserStatus.Rejected;
    }
}

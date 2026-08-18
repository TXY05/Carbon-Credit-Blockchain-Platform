// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistry {
    address public admin;

    struct Buyer {
        string role;
        string firstName;
        string lastName;
        string email;
        string phoneNumber;
        string country;
        string password;
        uint256 tokens;
        uint256 credits;
        UserStatus status;
    }

    enum UserStatus {
        None,
        Pending,
        Approved,
        Rejected
    }

    mapping(address => Buyer) public buyers;

    event RegistrationRequested(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    

    constructor() {
        admin = msg.sender;
    }

    function purchaseTokens(uint256 _amount) public {}

    function registerUser(
        string memory _role,
        string memory _firstName,
        string memory _lastName,
        string memory _email,
        string memory _phoneNumber,
        string memory _country,
        string memory _password
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
            status: UserStatus.Pending,
            password: _password,
            tokens: 0,
            credits: 0
        });

        emit RegistrationRequested(msg.sender);
    }

    function isApprovedUser(address user)external view returns (bool)
    {
        return buyers[user].status == UserStatus.Approved;
    }

    function approveUser(address _user) public onlyAdmin {}

    function rejectUser(address _user) public onlyAdmin {}

    
}

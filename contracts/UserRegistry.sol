// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistry {
    address public owner;
    mapping(address => User) buyers;
    mapping(address => User) developers;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "User is not owner");
        _;
    }

    struct User {
        UserRole role;
        string firstName;
        string lastName;
        string email;
        string phoneNumber;
        string country;
    }

    enum UserRole {
        Buyer,
        Developer
    }

    function registerUser(
        address _user,
        UserRole role
    ) public onlyOwner returns (bool) {
        if (role == UserRole.Buyer) {
            buyers[_user].role = role;
        } else {
            developers[_user].role = role;
        }
        return true;
    }

    function removeUser(address user) public onlyOwner returns (bool) {
        delete buyers[user];

        return true;
    }
}

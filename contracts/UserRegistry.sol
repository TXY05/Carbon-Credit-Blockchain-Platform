// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistry {
    address public owner;
    mapping(address => User) private users;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "User is not owner");
        _;
    }

    event UserRegistered(address indexed user, UserRole role);

    struct User {
        UserRole role;
    }

    enum UserRole {
        None,
        Buyer,
        Developer
    }

    function registerUser(
        address user,
        UserRole role
    ) external onlyOwner returns (bool) {
        require(user != address(0), "Invalid address");
        require(users[user].role == UserRole.None, "User already registered");
        require(role != UserRole.None, "Invalid role");

        users[user] = User({role: role});

        emit UserRegistered(user, role);

        return true;
    }

    function isRegistered(address user) external view returns (bool) {
        return users[user].role != UserRole.None;
    }

    function getUserRole(address user) external view returns (UserRole role) {
        return users[user].role;
    }

    function isBuyer(address user) external view returns (bool) {
        return users[user].role == UserRole.Buyer;
    }

    function isDeveloper(address user) external view returns (bool) {
        return users[user].role == UserRole.Developer;
    }
}

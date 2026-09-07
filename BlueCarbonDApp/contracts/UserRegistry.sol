// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistry {
    address public owner;
    mapping(address => User) private users;
    mapping(address => bool) private admins;
    address[] private userList;

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not admin");
        _;
    }

    function addAdmin(address account) external onlyOwner {
        admins[account] = true;
    }

    event UserRegistered(address indexed user, UserRole role);

    struct User {
        UserRole role;
        uint256 registeredAt;
    }

    enum UserRole {
        None,
        Buyer,
        Developer
    }

    function registerUser(
        address user,
        UserRole role
    ) external onlyAdmin returns (bool) {
        require(user != address(0), "Invalid address");
        require(users[user].role == UserRole.None, "User already registered");
        require(role != UserRole.None, "Invalid role");

        users[user] = User({role: role, registeredAt: block.timestamp});
        userList.push(user);
        emit UserRegistered(user, role);

        return true;
    }

    function isRegistered(address user) external view returns (bool) {
        return users[user].role != UserRole.None;
    }

    function isAdmin(address user) external view returns (bool) {
        return admins[user];
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

    function getAllUsers()
        external
        view
        returns (
            address[] memory addresses,
            UserRole[] memory roles,
            uint256[] memory registeredAt
        )
    {
        uint256 length = userList.length;

        addresses = new address[](length);
        roles = new UserRole[](length);
        registeredAt = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            addresses[i] = userList[i];
            roles[i] = users[userList[i]].role;
            registeredAt[i] = users[userList[i]].registeredAt;
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 引入 OpenZeppelin 现成的 ERC20 核心逻辑库
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// 引入 OpenZeppelin 的权限控制库 (提供 onlyOwner 功能)
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlueCarbonToken is ERC20, Ownable {
    
    // 构造函数：在合约部署的那一刻触发
    // "Blue Carbon Credit" 是全称，"BCC" 是代币代码
    // msg.sender 代表部署这个合约的人（即系统管理员 Admin）
    constructor() ERC20("Blue Carbon Credit", "BCC") Ownable(msg.sender) {}

    /**
     * @dev 核心发币逻辑 (对应你流程图中的 Mint ERC-20 Tokens)
     * @param to 接收代币的钱包地址（项目方的地址）
     * @param amount 铸造的数量 (前端算好的 Carbon Volume)
     * onlyOwner 确保了只有管理员(Admin)有资格调用这个函数
     */
    function mint(address to, uint256 amount) public onlyOwner {
        // 调用底层 _mint 函数真正发币
        // 注意：Solidity 中默认没有小数，通常在数值后补 18 个 0 (decimals)
        _mint(to, amount);
    }
}
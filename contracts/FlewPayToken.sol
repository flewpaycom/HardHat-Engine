// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract FlewPayToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensPaused();
    event TokensUnpaused();

    constructor(address initialAdmin)
        ERC20("FlewPayToken", "FLUPAY")
        ERC20Permit("FlewPayToken")
    {
        _setupRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _setupRole(MINTER_ROLE, initialAdmin);
        _setupRole(PAUSER_ROLE, initialAdmin);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
        emit TokensPaused();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
        emit TokensUnpaused();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}
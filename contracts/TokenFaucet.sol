// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract TokenFaucet {
    MyToken public token;

    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;
    uint256 public constant COOLDOWN_TIME = 24 * 60 * 60; // 24h
    uint256 public constant MAX_CLAIM_AMOUNT = 1000 * 10**18;

    address public admin;
    bool private paused;

    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    constructor(address tokenAddress) {
        token = MyToken(tokenAddress);
        admin = msg.sender;
        paused = false;
    }

    function requestTokens() external {
        require(!paused, "Faucet is paused");
        
        // Check if user has reached lifetime limit
        if (totalClaimed[msg.sender] >= MAX_CLAIM_AMOUNT) {
            require(false, "Lifetime claim limit reached");
        }
        
        // Check cooldown
        if (lastClaimAt[msg.sender] != 0) {
            require(block.timestamp >= lastClaimAt[msg.sender] + COOLDOWN_TIME, "Claim conditions not met");
        }

        uint256 remaining = remainingAllowance(msg.sender);
        require(remaining >= FAUCET_AMOUNT, "Exceeds max claim");

        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        token.mint(msg.sender, FAUCET_AMOUNT);
        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

   function canClaim(address user) public view returns (bool) {
    if (paused) return false;

    // Allow first claim
    if (lastClaimAt[user] == 0) return true;

    // Check cooldown and lifetime limit
    bool cooldownPassed = block.timestamp >= lastClaimAt[user] + COOLDOWN_TIME;
    bool withinLimit = totalClaimed[user] < MAX_CLAIM_AMOUNT;

    return cooldownPassed && withinLimit;
}


    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return 0;
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function setPaused(bool _paused) external {
        require(msg.sender == admin, "Only admin");
        paused = _paused;
        emit FaucetPaused(paused);
    }

    function isPaused() external view returns (bool) {
        return paused;
    }
}
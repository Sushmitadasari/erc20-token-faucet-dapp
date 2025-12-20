// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Token.sol";

/**
 * @title TokenFaucet
 * @dev ERC-20 faucet with cooldown, lifetime limits, and pause control
 */
contract TokenFaucet {
    /// @notice Token distributed by faucet
    FaucetToken public immutable token;

    /// @notice Tokens per claim (100 tokens)
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18;

    /// @notice Cooldown period (24 hours)
    uint256 public constant COOLDOWN_TIME = 24 hours;

    /// @notice Maximum lifetime claim per address (1000 tokens)
    uint256 public constant MAX_CLAIM_AMOUNT = 1000 * 10 ** 18;

    /// @notice Admin address
    address public immutable admin;

    /// @notice Faucet paused state
    bool private paused;

    /// @notice Last claim timestamp per address
    mapping(address => uint256) public lastClaimAt;

    /// @notice Total claimed amount per address
    mapping(address => uint256) public totalClaimed;

    /// @notice Emitted on successful token claim
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);

    /// @notice Emitted when faucet pause state changes
    event FaucetPaused(bool paused);

    /**
     * @param tokenAddress Deployed ERC-20 token address
     */
    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token address");
        token = FaucetToken(tokenAddress);
        admin = msg.sender;
        paused = false;
    }

    /**
     * @notice Claim tokens from the faucet
     */
    function requestTokens() external {
        require(!paused, "Faucet is paused");
        require(canClaim(msg.sender), "Claim conditions not met");
        require(
            remainingAllowance(msg.sender) >= FAUCET_AMOUNT,
            "Lifetime claim limit reached"
        );

        // Effects
        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        // Interaction
        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    /**
     * @notice Check if user can claim tokens now
     */
    function canClaim(address user) public view returns (bool) {
        if (paused) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        return true;
    }

    /**
     * @notice Remaining lifetime claim allowance
     */
    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) {
            return 0;
        }
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    /**
     * @notice Pause or unpause the faucet (admin only)
     */
    function setPaused(bool _paused) external {
        require(msg.sender == admin, "Only admin");
        paused = _paused;
        emit FaucetPaused(_paused);
    }

    /**
     * @notice Check if faucet is paused
     */
    function isPaused() external view returns (bool) {
        return paused;
    }
}

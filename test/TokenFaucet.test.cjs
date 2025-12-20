const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Token Faucet DApp", function () {
  let Token, Faucet, token, faucet;
  let owner, user1, user2;

  const FAUCET_AMOUNT = ethers.parseEther("100");
  const MAX_CLAIM_AMOUNT = ethers.parseEther("1000");
  const COOLDOWN_TIME = 24 * 60 * 60; // 24 hours

  beforeEach(async function () {
  [owner, user1, user2] = await ethers.getSigners();

  // Deploy token WITHOUT faucet first (no constructor args)
  const TokenFactory = await ethers.getContractFactory("FaucetToken");
  token = await TokenFactory.deploy();
  await token.waitForDeployment();

  // Deploy faucet with token address
  const FaucetFactory = await ethers.getContractFactory("TokenFaucet");
  faucet = await FaucetFactory.deploy(await token.getAddress());
  await faucet.waitForDeployment();

  // Set faucet in token (one-time)
  await token.setFaucet(await faucet.getAddress());
});

  /* -------------------------------------------------- */
  /* 1. Token deployment and initial state              */
  /* -------------------------------------------------- */
  it("should deploy token with correct max supply and zero initial supply", async function () {
    expect(await token.totalSupply()).to.equal(0n);
    expect(await token.MAX_SUPPLY()).to.be.gt(0n);
  });

  /* -------------------------------------------------- */
  /* 2. Faucet deployment and configuration             */
  /* -------------------------------------------------- */
  it("should set deployer as admin", async function () {
    expect(await faucet.admin()).to.equal(owner.address);
  });

  /* -------------------------------------------------- */
  /* 3. Successful token claim                          */
  /* -------------------------------------------------- */
  it("should allow user to successfully claim tokens", async function () {
    await faucet.connect(user1).requestTokens();

    const balance = await token.balanceOf(user1.address);
    expect(balance).to.equal(FAUCET_AMOUNT);
  });

  /* -------------------------------------------------- */
  /* 4. Cooldown enforcement                            */
  /* -------------------------------------------------- */
  it("should revert if user tries to claim during cooldown", async function () {
    await faucet.connect(user1).requestTokens();

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Claim conditions not met");
  });

  /* -------------------------------------------------- */
  /* 5. Cooldown expiry allows re-claim                 */
  /* -------------------------------------------------- */
  it("should allow claim after cooldown period", async function () {
    await faucet.connect(user1).requestTokens();

    await network.provider.send("evm_increaseTime", [COOLDOWN_TIME + 1]);
    await network.provider.send("evm_mine");

    await faucet.connect(user1).requestTokens();
    expect(await token.balanceOf(user1.address)).to.equal(
      FAUCET_AMOUNT * 2n
    );
  });

  /* -------------------------------------------------- */
  /* 6. Lifetime limit enforcement                      */
  /* -------------------------------------------------- */
  it("should enforce lifetime claim limit", async function () {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user1).requestTokens();
      await network.provider.send("evm_increaseTime", [COOLDOWN_TIME + 1]);
      await network.provider.send("evm_mine");
    }

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Lifetime claim limit reached");
  });

  /* -------------------------------------------------- */
  /* 7. Pause mechanism                                 */
  /* -------------------------------------------------- */
  it("should prevent claims when faucet is paused", async function () {
    await faucet.connect(owner).setPaused(true);

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Faucet is paused");
  });

  /* -------------------------------------------------- */
  /* 8. Admin-only pause control                        */
  /* -------------------------------------------------- */
  it("should allow only admin to pause faucet", async function () {
    await expect(
      faucet.connect(user1).setPaused(true)
    ).to.be.revertedWith("Only admin");
  });

  /* -------------------------------------------------- */
  /* 9. Event emissions                                 */
  /* -------------------------------------------------- */
  it("should emit TokensClaimed event on successful claim", async function () {
    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(
        user1.address,
        FAUCET_AMOUNT,
        await ethers.provider.getBlock("latest").then(b => b.timestamp + 1)
      );
  });

  it("should emit FaucetPaused event when paused", async function () {
    await expect(faucet.connect(owner).setPaused(true))
      .to.emit(faucet, "FaucetPaused")
      .withArgs(true);
  });

  /* -------------------------------------------------- */
  /* 10. Multiple users claiming independently          */
  /* -------------------------------------------------- */
  it("should track claims independently per user", async function () {
    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    expect(await token.balanceOf(user2.address)).to.equal(FAUCET_AMOUNT);
  });

  /* -------------------------------------------------- */
  /* Edge case: remaining allowance never negative      */
  /* -------------------------------------------------- */
  it("remainingAllowance should return zero when max reached", async function () {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user1).requestTokens();
      await network.provider.send("evm_increaseTime", [COOLDOWN_TIME + 1]);
      await network.provider.send("evm_mine");
    }

    expect(await faucet.remainingAllowance(user1.address)).to.equal(0n);
  });
});

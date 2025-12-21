const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Token Faucet System", function () {
  let token, faucet;
  let owner, user1, user2;

  const FAUCET_AMOUNT = ethers.parseEther("100");
  const MAX_CLAIM = ethers.parseEther("1000");
  const DAY = 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MyToken");
    token = await Token.deploy(owner.address);
    await token.waitForDeployment();

    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(token.target);
    await faucet.waitForDeployment();

    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, faucet.target);
  });

  /* ------------------------------------------------------ */
  it("1. Token deployment and initial state", async function () {
    expect(await token.totalSupply()).to.equal(0);
  });

  it("2. Faucet deployment and configuration", async function () {
    expect(await faucet.isPaused()).to.equal(false);
  });

  it("3. Successful token claim", async function () {
    await faucet.connect(user1).requestTokens();
    expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
  });

  it("4. Cooldown enforcement", async function () {
    await faucet.connect(user1).requestTokens();

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Cannot claim now");
  });

  it("5. Lifetime limit enforcement", async function () {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user1).requestTokens();
      await network.provider.send("evm_increaseTime", [DAY]);
      await network.provider.send("evm_mine");
    }

    expect(await faucet.totalClaimed(user1.address)).to.equal(MAX_CLAIM);

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Cannot claim now");
  });

  it("6. Pause mechanism", async function () {
    await faucet.setPaused(true);

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Faucet is paused");
  });

  it("7. Admin-only pause function", async function () {
    await expect(
      faucet.connect(user1).setPaused(true)
    ).to.be.revertedWith("Only admin can pause");
  });

 it("8. Event emissions", async function () {
  const tx = await faucet.connect(user1).requestTokens();
  const receipt = await tx.wait();

  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "TokensClaimed"
  );

  const block = await ethers.provider.getBlock(receipt.blockNumber);

  expect(event.args[0]).to.equal(user1.address);
  expect(event.args[1]).to.equal(FAUCET_AMOUNT);
  expect(event.args[2]).to.be.closeTo(block.timestamp, 1);
});


  it("9. Edge cases (zero balance start)", async function () {
    expect(await token.balanceOf(user1.address)).to.equal(0);
  });

  it("10. Multiple users claim independently", async function () {
    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    expect(await token.balanceOf(user2.address)).to.equal(FAUCET_AMOUNT);
  });

  async function time() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});
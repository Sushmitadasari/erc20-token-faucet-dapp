import hre from "hardhat";
import fs from "fs";

const { ethers } = hre;

async function main() {
  console.log("🚀 Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1️⃣ Deploy Token
  const Token = await ethers.getContractFactory("MyToken");
  // Deploy token with placeholder faucet address; grant faucet role after deployment
  const token = await Token.deploy(ethers.ZeroAddress);
  await token.waitForDeployment();
  console.log("Token deployed at:", token.target);

  // 2️⃣ Deploy Faucet
  const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
  const faucet = await TokenFaucet.deploy(token.target);
  await faucet.waitForDeployment();
  console.log("Faucet deployed at:", faucet.target);

 // 3️⃣ Grant MINTER_ROLE to Faucet
  const MINTER_ROLE = await token.MINTER_ROLE();
  const tx = await token.grantRole(MINTER_ROLE, faucet.target);
  await tx.wait();
  console.log("🔑 Mint role granted to Faucet");


  // 4️⃣ Save addresses for frontend
  const addresses = {
    token: token.target,
    faucet: faucet.target,
  };
  fs.writeFileSync("deployment-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("Addresses saved to deployment-addresses.json");

  const isLiveNetwork = !["hardhat", "localhost"].includes(hre.network.name);
  if (isLiveNetwork) {
    console.log(" Waiting 30s before verification...");
    await new Promise((r) => setTimeout(r, 30000));

    await hre.run("verify:verify", {
      address: token.target,
      constructorArguments: [ethers.ZeroAddress],
    });

    await hre.run("verify:verify", {
      address: faucet.target,
      constructorArguments: [token.target],
    });

    console.log(" Contracts verified on Etherscan");
  } else {
    console.log(`Skipping Etherscan verification on network: ${hre.network.name}`);
  }
}

main().catch((error) => {
  console.error(" Deployment failed:", error);
  process.exitCode = 1;
});
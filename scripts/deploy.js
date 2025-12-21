const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1️⃣ Deploy Token
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy(deployer.address); // pass deployer as minter for now
  console.log("Token deployed at:", token.target); // ethers v6 uses .target

  // 2️⃣ Deploy Faucet
  const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
  const faucet = await TokenFaucet.deploy(token.target);
  console.log("Faucet deployed at:", faucet.target);

 // 3️⃣ Grant MINTER_ROLE to Faucet
const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
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

  console.log(" Waiting 30s before verification...");
  await new Promise((r) => setTimeout(r, 30000));

  await hre.run("verify:verify", {
    address: token.target,
    constructorArguments: [deployer.address],
  });

  await hre.run("verify:verify", {
    address: faucet.target,
    constructorArguments: [token.target],
  });

  console.log(" Contracts verified on Etherscan");
}

main().catch((error) => {
  console.error(" Deployment failed:", error);
  process.exitCode = 1;
});
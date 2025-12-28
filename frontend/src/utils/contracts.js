import { ethers } from "ethers";
import TokenABI from "../hardhat-artifacts/Token.sol/MyToken.json";
import FaucetABI from "../hardhat-artifacts/TokenFaucet.sol/TokenFaucet.json";

// Addresses come from Vite env if provided; fallback to previous hard-coded values.
// Set VITE_TOKEN_ADDRESS and VITE_FAUCET_ADDRESS in .env to match the network you're using.
const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS || "0x890366DDF2aCA587bC8C65988CdA170D660C6a00";
const faucetAddress = import.meta.env.VITE_FAUCET_ADDRESS || "0x5887f06ac93Fe10Ee2A2b08f9460837508054747";

let provider, signer, tokenContract, faucetContract;

export async function getProvider() {
  if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
}

export async function getSigner() {
  if (!signer) signer = await (await getProvider()).getSigner();
  return signer;
}

export async function getTokenContract() {
  if (!tokenContract) tokenContract = new ethers.Contract(tokenAddress, TokenABI.abi, await getSigner());
  return tokenContract;
}

export async function getFaucetContract() {
  if (!faucetContract) faucetContract = new ethers.Contract(faucetAddress, FaucetABI.abi, await getSigner());
  return faucetContract;
}

export async function getBalance(addr) {
  const contract = await getTokenContract();
  return (await contract.balanceOf(addr)).toString();
}

export async function canClaim(addr) {
  const contract = await getFaucetContract();
  return await contract.canClaim(addr);
}

export async function getRemainingAllowance(addr) {
  const contract = await getFaucetContract();
  return (await contract.remainingAllowance(addr)).toString();
}

export async function requestTokens() {
  const contract = await getFaucetContract();
  const tx = await contract.requestTokens();
  await tx.wait();
}

// Diagnostic helpers to explain eligibility status in the UI
export async function isPaused() {
  const contract = await getFaucetContract();
  return await contract.isPaused();
}

export async function getLastClaimAt(addr) {
  const contract = await getFaucetContract();
  const ts = await contract.lastClaimAt(addr);
  return ts.toString();
}

export async function getTotalClaimed(addr) {
  const contract = await getFaucetContract();
  return (await contract.totalClaimed(addr)).toString();
}

export async function getCooldownTime() {
  const contract = await getFaucetContract();
  return (await contract.COOLDOWN_TIME()).toString();
}

export async function getMaxClaimAmount() {
  const contract = await getFaucetContract();
  return (await contract.MAX_CLAIM_AMOUNT()).toString();
}
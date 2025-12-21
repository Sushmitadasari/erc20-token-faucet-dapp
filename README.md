# Full Stack ERC-20 Token Faucet DApp

## Project Overview
This project is a decentralized application (DApp) that lets users claim free ERC-20 tokens from a "Faucet." To keep things fair and prevent spam, the smart contract enforces a strict **24-hour cooldown** and a **lifetime claim limit** per wallet.

I built this to demonstrate how a modern Web3 stack works—from writing secure smart contracts in Solidity to building a responsive React frontend that talks to the blockchain via MetaMask.

---

## What’s Inside?

### The Smart Contracts
* **ERC-20 Token:** A standard token built using OpenZeppelin’s secure library.
* **Token Faucet:** The "distributor" contract that manages logic like:
    * Checking if a user is eligible to claim.
    * Enforcing the 24-hour wait time.
    * Allowing an admin to pause the faucet if needed.

### The Frontend
* **Wallet Connection:** Easy "Connect Wallet" button for MetaMask users.
* **Live Status:** Shows your current token balance and tells you exactly how much longer you have to wait before your next claim.
* **Transaction Feedback:** Clear messages so users know when their transaction is pending, successful, or failed.

---

## Tech Stack
* **Smart Contracts:** Solidity, Hardhat, OpenZeppelin
* **Frontend:** React.js, Ethers.js
* **Environment:** Docker, MetaMask (Wallet), Sepolia Testnet

---

## Project Structure
```text
.
├── contracts/          # Solidity code (The "Brain" of the DApp)
├── frontend/           # React code (The "Face" of the DApp)
├── test/               # Automated tests to make sure logic is solid
├── scripts/            # Scripts to deploy contracts to the web
├── docker-compose.yml  # For running the whole project in a container
└── .env.example        # Template for your private keys/API URLs

```

---

## Getting Started

### 1. Clone & Install

First, grab the code and install the dependencies for both the backend and the frontend:

```bash
git clone [https://github.com/Sushmitadasari/erc20-token-faucet-dapp]
cd Full-Stack-ERC-20-Token-Faucet-DApp

# Install Hardhat dependencies
npm install

# Install Frontend dependencies
cd frontend
npm install
cd ..

```

### 2. Setup Environment Variables

Create a `.env` file in the root directory. You'll need to add your Sepolia RPC URL (from Infura or Alchemy) and your wallet's private key.

```bash
cp .env.example .env

```

### 3. Run Locally (Docker)

If you have Docker installed, you can get everything running with one command:

```bash
docker compose up

```

Your DApp should now be running at `http://localhost:5173`.

---

## How to Use the DApp

1. **Connect:** Open the site and hit "Connect Wallet" (Make sure your MetaMask is on the **Sepolia Testnet**).
2. **Check Status:** The app will tell you if you're eligible. If you've claimed in the last 24 hours, it will show a countdown.
3. **Claim:** Click "Request Tokens" and confirm the gas fee in MetaMask.
4. **Wait:** Once the block confirms, your balance will update automatically!

---

## Testing & Deployment

### Run Tests

It's always good practice to check the logic before deploying:

```bash
npx hardhat test

```

### Deploy to Sepolia

To put this live on the testnet:

```bash
npx hardhat run scripts/deploy.js --network sepolia

```

---

## Troubleshooting

* **Transaction Rejected?** Make sure you have some "Test ETH" in your Sepolia wallet to pay for gas.
* **Balance not showing?** Double-check that you've imported the Token Contract Address into your MetaMask "Assets" tab.
* **Docker errors?** Try `docker compose down` and restart.



import { useState } from "react";
import "./App.css";
import "./utils/eval"; // IMPORTANT: side-effect import only

function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [eligible, setEligible] = useState(false);
  const [allowance, setAllowance] = useState("0");
  const [loading, setLoading] = useState(false);

  const refresh = async (addr) => {
    const bal = await window.__EVAL__.getBalance(addr);
    const can = await window.__EVAL__.canClaim(addr);
    const rem = await window.__EVAL__.getRemainingAllowance(addr);

    setBalance(bal);
    setEligible(can);
    setAllowance(rem);
  };

  const handleConnect = async () => {
    const addr = await window.__EVAL__.connectWallet();
    setAddress(addr);
    await refresh(addr);
  };

  const handleClaim = async () => {
    try {
      setLoading(true);
      await window.__EVAL__.requestTokens();
      await refresh(address);
      alert("✅ Tokens claimed successfully!");
    } catch (e) {
      alert(e.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="title">🚰 Token Faucet</div>

        {!address ? (
          <button className="primary" onClick={handleConnect}>
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="row">
              <span className="label">Address:</span>
              <div className="value">{address}</div>
            </div>

            <div className="row">
              <span className="label">Balance:</span>
              <div className="value">{balance}</div>
            </div>

            <div className="row">
              <span className="label">Remaining Allowance:</span>
              <div className="value">{allowance}</div>
            </div>

            <div className="row">
              <span className="label">Eligibility:</span>
              {eligible ? (
                <span className="badge success">Eligible</span>
              ) : (
                <span className="badge error">Not Eligible</span>
              )}
            </div>

            <button
              className="primary"
              disabled={!eligible || loading}
              onClick={handleClaim}
            >
              {loading ? "Claiming..." : "Claim Tokens"}
            </button>
          </>
        )}

        <div className="footer">Sepolia Testnet • ERC-20 Faucet</div>
      </div>
    </div>
  );
}

export default App;
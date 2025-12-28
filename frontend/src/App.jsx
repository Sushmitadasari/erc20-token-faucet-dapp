import { useState } from "react";
import "./App.css";
import "./utils/eval"; // IMPORTANT: side-effect import only

function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [eligible, setEligible] = useState(false);
  const [allowance, setAllowance] = useState("0");
  const [paused, setPaused] = useState(false);
  const [lastClaimAt, setLastClaimAt] = useState("0");
  const [totalClaimed, setTotalClaimed] = useState("0");
  const [cooldown, setCooldown] = useState("0");
  const [maxClaim, setMaxClaim] = useState("0");
  const [loading, setLoading] = useState(false);

  const refresh = async (addr) => {
    const [bal, can, rem, isPausedFlag, lastClaimTs, totalClaimedAmt, cdTime, maxAmt] = await Promise.all([
      window.__EVAL__.getBalance(addr),
      window.__EVAL__.canClaim(addr),
      window.__EVAL__.getRemainingAllowance(addr),
      window.__EVAL__.isPaused(),
      window.__EVAL__.getLastClaimAt(addr),
      window.__EVAL__.getTotalClaimed(addr),
      window.__EVAL__.getCooldownTime(),
      window.__EVAL__.getMaxClaimAmount(),
    ]);

    setBalance(bal);
    setEligible(can);
    setAllowance(rem);
    setPaused(isPausedFlag);
    setLastClaimAt(lastClaimTs);
    setTotalClaimed(totalClaimedAmt);
    setCooldown(cdTime);
    setMaxClaim(maxAmt);
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

            {!eligible && (
              <div className="helper">
                {paused && <div>Faucet is paused by admin.</div>}
                {!paused && lastClaimAt !== "0" && Number(cooldown) > 0 && (
                  <div>
                    Cooldown: try again in {formatCooldown(lastClaimAt, cooldown)}.
                  </div>
                )}
                {!paused && Number(totalClaimed) >= Number(maxClaim) && (
                  <div>Lifetime limit reached ({Number(maxClaim) / 1e18} tokens).</div>
                )}
              </div>
            )}

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

function formatCooldown(lastClaimTs, cooldownSeconds) {
  const last = Number(lastClaimTs);
  const cooldown = Number(cooldownSeconds);
  const now = Math.floor(Date.now() / 1000);
  const remaining = last + cooldown - now;
  if (remaining <= 0) return "a moment";

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!hours && !minutes) parts.push(`${seconds}s`);
  return parts.join(" ");
}
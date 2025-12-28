import { connectWallet } from "./wallet";
import {
  getBalance,
  canClaim,
  getRemainingAllowance,
  requestTokens,
  isPaused,
  getLastClaimAt,
  getTotalClaimed,
  getCooldownTime,
  getMaxClaimAmount,
} from "./contracts";

// Expose a single API on the window so App.jsx can call blockchain helpers without direct imports.
const api = {
  connectWallet,
  getBalance,
  canClaim,
  getRemainingAllowance,
  requestTokens,
  isPaused,
  getLastClaimAt,
  getTotalClaimed,
  getCooldownTime,
  getMaxClaimAmount,
};

// Avoid clobbering if hot reloaded.
// eslint-disable-next-line no-underscore-dangle
window.__EVAL__ = api;

export default api;
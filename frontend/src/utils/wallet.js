export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Install MetaMask");
    return;
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

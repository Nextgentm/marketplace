export const NETWORKS = {
  SOMNIA: {
    chainId: "0xC4B0", // 50312 in hex
    chainName: "Somnia Testnet",
    nativeCurrency: {
      name: "STT",
      symbol: "STT",
      decimals: 18
    },
    rpcUrls: ["https://dream-rpc.somnia.network/"],
    blockExplorerUrls: ["https://shannon-explorer.somnia.network/", "https://somnia-testnet.socialscan.io/"]
  }
};

export const getNetworkConfig = (chainId) => {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId);
};

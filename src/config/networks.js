export const NETWORKS = {
  SOMNIA: {
    chainId: "0xc4b8", // 50312 in hex
    chainName: "Somnia Testnet",
    nativeCurrency: {
      name: "STT",
      symbol: "STT",
      decimals: 18
    },
    rpcUrls: ["https://rpc.ankr.com/somnia_testnet/4944aadf64955e934d28b7cc94862e884aa31a677eeb19fb056087b60370c80c"],
    blockExplorerUrls: ["https://shannon-explorer.somnia.network/"]
  }
};

export const getNetworkConfig = (chainId) => {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId);
};

export const EXAMPLE_PATH = "blog-starter";
export const CMS_NAME = "Markdown";
export const HOME_OG_IMAGE_URL =
  "https://og-image.vercel.app/Next.js%20Blog%20Starter%20Example.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg";

export const DEFAULT_NETWORK = "Somnia";

// Chain IDs
export const ETHEREUM_NETWORK_CHAIN_ID = "0xaa36a7"; // Sepolia testnet
export const POLYGON_NETWORK_CHAIN_ID = "0x13882"; // Mumbai testnet
export const BINANCE_NETWORK_CHAIN_ID = "0x61"; // BSC testnet
export const SOMNIA_NETWORK_CHAIN_ID = "0xC488"; // Somnia testnet (50312 in hex)

// Single source of truth for network configurations
export const NETWORKS = {
  [ETHEREUM_NETWORK_CHAIN_ID]: {
    chainId: "0xaa36a7",
    chainName: "Sepolia Test Network",
    nativeCurrency: { name: "SepoliaETH", symbol: "SepoliaETH", decimals: 18 },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"]
  },
  [POLYGON_NETWORK_CHAIN_ID]: {
    chainId: "0x13882",
    chainName: "Mumbai",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
  },
  [BINANCE_NETWORK_CHAIN_ID]: {
    chainId: "0x61",
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    rpcUrls: ["https://data-seed-prebsc-1-s3.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"]
  },
  [SOMNIA_NETWORK_CHAIN_ID]: {
    chainId: "0xC488",
    chainName: "Somnia Testnet",
    nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/somnia_testnet/4944aadf64955e934d28b7cc94862e884aa31a677eeb19fb056087b60370c80c"],
    blockExplorerUrls: ["https://shannon-explorer.somnia.network/"]
  }
};

// Helper function to get chainId from network name
export const getChainIdFromNetworkName = (networkName) => {
  switch (networkName) {
    case "Ethereum":
      return ETHEREUM_NETWORK_CHAIN_ID;
    case "Polygon":
      return POLYGON_NETWORK_CHAIN_ID;
    case "Binance":
      return BINANCE_NETWORK_CHAIN_ID;
    case "Somnia":
      return SOMNIA_NETWORK_CHAIN_ID;
    default:
      return null;
  }
};

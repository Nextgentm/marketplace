/* eslint quotes: "off" */
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

// Export NETWORKS_CHAINS as an alias for NETWORKS
export const NETWORKS_CHAINS = NETWORKS;

// Helper function to get chain ID from network name
export const getChainIdByNetworkName = (networkName) => {
  console.log("inside getChainIdByNetworkName networkName = ", networkName);
  if (!networkName) {
    console.log("Network name is undefined or null");
    return null;
  }

  const networkNameLower = networkName.toLowerCase();
  console.log("Looking up chain ID for network:", networkNameLower);

  switch (networkNameLower) {
    case "ethereum":
      return ETHEREUM_NETWORK_CHAIN_ID;
    case "polygon":
      return POLYGON_NETWORK_CHAIN_ID;
    case "binance":
      return BINANCE_NETWORK_CHAIN_ID;
    case "somnia":
      return SOMNIA_NETWORK_CHAIN_ID;
    default:
      console.log("No matching chain ID found for network:", networkName);
      return null;
  }
};

// Helper function to get network name from chain ID
export const getNetworkNameByChainId = (chainId) => {
  console.log("Getting network name for chain ID:", chainId);
  if (!chainId) {
    console.log("Chain ID is undefined or null");
    return null;
  }

  // Convert chainId to lowercase and remove '0x' prefix if present
  const chainIdLower = chainId.toLowerCase().replace('0x', '');
  console.log("Looking up network name for chain ID:", chainIdLower);

  // Compare with chain IDs without '0x' prefix
  switch (chainIdLower) {
    case ETHEREUM_NETWORK_CHAIN_ID.toLowerCase().replace('0x', ''):
      return "Ethereum";
    case POLYGON_NETWORK_CHAIN_ID.toLowerCase().replace('0x', ''):
      return "Polygon";
    case BINANCE_NETWORK_CHAIN_ID.toLowerCase().replace('0x', ''):
      return "Binance";
    case SOMNIA_NETWORK_CHAIN_ID.toLowerCase().replace('0x', ''):
      return "Somnia";
    default:
      console.log("No matching network name found for chain ID:", chainId);
      return null;
  }
};

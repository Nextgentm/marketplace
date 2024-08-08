export const EXAMPLE_PATH = "blog-starter";
export const CMS_NAME = "Markdown";
export const HOME_OG_IMAGE_URL =
  "https://og-image.vercel.app/Next.js%20Blog%20Starter%20Example.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg";

export const DEFAULT_NETWORK = "Binance"; // testnet chain Id's

export const ETHEREUM_NETWORK_CHAIN_ID = "0xaa36a7"; // testnet chain Id's
export const POLYGON_NETWORK_CHAIN_ID = "0x13881"; // testnet chain Id's
export const BINANCE_NETWORK_CHAIN_ID = "0x61"; // testnet chain Id's
// export const ETHEREUM_NETWORK_CHAIN_ID = "0x1"; // mainnet chain Id's
// export const POLYGON_NETWORK_CHAIN_ID = "0x89"; // mainnet chain Id's
// export const BINANCE_NETWORK_CHAIN_ID = "0x38"; // mainnet chain Id's

// network name to chain id
export const NETWORKS = {
  "Polygon": POLYGON_NETWORK_CHAIN_ID,
  "Ethereum": ETHEREUM_NETWORK_CHAIN_ID,
  "Binance": BINANCE_NETWORK_CHAIN_ID
};
// chain id to rpc url
export const NETWORKS_CHAINS = {
  "0x5": {
    chainId: "0xaa36a7",
    chainName: "Sepolia Test Netwok",
    nativeCurrency: { name: "SepoliaETH", symbol: "SepoliaETH", decimals: 18 },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"]
  },
  "0x13881": {
    chainId: "0x13881",
    chainName: "Mumbai",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
  },
  "0x61": {
    chainId: "0x61",
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    rpcUrls: ["https://data-seed-prebsc-1-s3.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"]
  }
  // "0x1": {
  //   chainId: "0x1",
  //   chainName: "Ethereum Mainnet",
  //   nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  //   rpcUrls: ["https://mainnet.infura.io/v3/"],
  //   blockExplorerUrls: ["https://etherscan.io"]
  // },
  // "0x89": {
  //   chainId: "0x89",
  //   chainName: "Polygon Mainnet",
  //   nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  //   rpcUrls: ["https://polygon-rpc.com/"],
  //   blockExplorerUrls: ["https://polygonscan.com/"]
  // },
  // "0x38": {
  //   chainId: "0x38",
  //   chainName: "BNB Smart Chain",
  //   nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  //   rpcUrls: ["https://rpc.ankr.com/bsc"],
  //   blockExplorerUrls: ["https://bscscan.com"]
  // }
};

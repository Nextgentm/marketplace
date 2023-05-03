export const EXAMPLE_PATH = "blog-starter";
export const CMS_NAME = "Markdown";
export const HOME_OG_IMAGE_URL =
  "https://og-image.vercel.app/Next.js%20Blog%20Starter%20Example.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg";

export const ETHEREUM_NETWORK_CHAIN_ID = "0x5"; // testnet chain Id's
export const POLYGON_NETWORK_CHAIN_ID = "0x13881"; // testnet chain Id's
export const BINANCE_NETWORK_CHAIN_ID = "0x61"; // testnet chain Id's

// network name to chain id
export const NETWORKS = {
  "Polygon": POLYGON_NETWORK_CHAIN_ID,
  "Ethereum": ETHEREUM_NETWORK_CHAIN_ID,
  "Binance": BINANCE_NETWORK_CHAIN_ID
};
// chain id to rpc url
export const NETWORKS_CHAINS = {
  "0x5": {
    chainId: "0x5",
    chainName: "Mumbai",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
  },
  "0x13881": {
    chainId: "0x13881",
    chainName: "Goerli test network",
    nativeCurrency: { name: "GoerliETH", symbol: "GoerliETH", decimals: 18 },
    rpcUrls: ["https://goerli.infura.io/v3/"],
    blockExplorerUrls: ["https://goerli.etherscan.io"]
  },
  "0x61": {
    chainId: "0x61",
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    rpcUrls: ["https://data-seed-prebsc-1-s3.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"]
  }
};

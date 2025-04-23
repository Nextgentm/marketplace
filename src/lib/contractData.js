import Factory721ContractArtifacts from "../abis/Factory721.json";
import Factory1155ContractArtifacts from "../abis/Factory1155.json";
import ERC721ContractContractArtifacts from "../abis/NFTMarketplace.json";
import ERC1155ContractContractArtifacts from "../abis/LootmogulUser1155Token.json";
import tokenContractArtifacts from "../abis/token.json";
import TradeContractArtifacts from "../abis/Trade.json";
import TransferProxyContractArtifacts from "../abis/TransferProxy.json";
import StakingNFTContractArtifacts from "../abis/StakingNFT.json";

export function getContractsData(network) {
  try {
    console.log("Getting contract data for network:", network);
    if (!network) {
      console.error("Network parameter is undefined or null");
      return null;
    }

    let contractData = {};

    // Get contract addresses based on network
    switch (network) {
      case "Ethereum":
        contractData = {
          Factory721Contract: { "address": process.env.NEXT_PUBLIC_ETHEREUM_FACTORY721_CONTRACT_ADDRESS },
          Factory1155Contract: { "address": process.env.NEXT_PUBLIC_ETHEREUM_FACTORY1155_CONTRACT_ADDRESS },
          TradeContract: { "address": process.env.NEXT_PUBLIC_ETHEREUM_TRADE_CONTRACT_ADDRESS },
          TransferProxy: { "address": process.env.NEXT_PUBLIC_ETHEREUM_TRANSFER_PROXY_CONTRACT_ADDRESS },
          StakingContract: { "address": process.env.NEXT_PUBLIC_ETHEREUM_STAKING_CONTRACT_ADDRESS }
        };
        break;
      case "Somnia":
        contractData = {
          Factory721Contract: { "address": process.env.NEXT_PUBLIC_SOMNIA_FACTORY721_CONTRACT_ADDRESS },
          Factory1155Contract: { "address": process.env.NEXT_PUBLIC_SOMNIA_FACTORY1155_CONTRACT_ADDRESS },
          TradeContract: { "address": process.env.NEXT_PUBLIC_SOMNIA_TRADE_CONTRACT_ADDRESS },
          TransferProxy: { "address": process.env.NEXT_PUBLIC_SOMNIA_TRANSFER_PROXY_CONTRACT_ADDRESS },
          StakingContract: { "address": process.env.NEXT_PUBLIC_SOMNIA_STAKING_CONTRACT_ADDRESS }
        };
        break;
      case "Polygon":
        contractData = {
          Factory721Contract: { "address": process.env.NEXT_PUBLIC_POLYGON_FACTORY721_CONTRACT_ADDRESS },
          Factory1155Contract: { "address": process.env.NEXT_PUBLIC_POLYGON_FACTORY1155_CONTRACT_ADDRESS },
          TradeContract: { "address": process.env.NEXT_PUBLIC_POLYGON_TRADE_CONTRACT_ADDRESS },
          TransferProxy: { "address": process.env.NEXT_PUBLIC_POLYGON_TRANSFER_PROXY_CONTRACT_ADDRESS },
          StakingContract: { "address": process.env.NEXT_PUBLIC_POLYGON_STAKING_CONTRACT_ADDRESS }
        };
        break;
      case "Binance":
        contractData = {
          Factory721Contract: { "address": process.env.NEXT_PUBLIC_BINANCE_FACTORY721_CONTRACT_ADDRESS },
          Factory1155Contract: { "address": process.env.NEXT_PUBLIC_BINANCE_FACTORY1155_CONTRACT_ADDRESS },
          TradeContract: { "address": process.env.NEXT_PUBLIC_BINANCE_TRADE_CONTRACT_ADDRESS },
          TransferProxy: { "address": process.env.NEXT_PUBLIC_BINANCE_TRANSFER_PROXY_CONTRACT_ADDRESS },
          StakingContract: { "address": process.env.NEXT_PUBLIC_BINANCE_STAKING_CONTRACT_ADDRESS }
        };
        break;
      default:
        console.error("Unsupported network:", network);
        return null;
    }

    // Validate contract addresses
    for (const [key, value] of Object.entries(contractData)) {
      if (!value.address) {
        console.error(`Missing contract address for ${key} on network ${network}`);
        return null;
      }
    }

    // Add contract ABIs
    contractData.Factory721Contract.abi = Factory721ContractArtifacts.abi;
    contractData.Factory1155Contract.abi = Factory1155ContractArtifacts.abi;
    contractData.ERC721Contract = { "abi": ERC721ContractContractArtifacts.abi };
    contractData.ERC1155Contract = { "abi": ERC1155ContractContractArtifacts.abi };
    contractData.TokenContract = { "abi": tokenContractArtifacts.abi };
    contractData.TradeContract.abi = TradeContractArtifacts.abi;
    contractData.TransferProxy.abi = TransferProxyContractArtifacts.abi;
    contractData.StakingContract.abi = StakingNFTContractArtifacts.abi;

    console.log("Contract data loaded successfully for network:", network);
    return contractData;
  } catch (error) {
    console.error("Error getting contract data:", error);
    return null;
  }
}

import Factory721ContractArtifacts from "../abis/Factory721.json";
import Factory1155ContractArtifacts from "../abis/Factory1155.json";
import ERC721ContractContractArtifacts from "../abis/NFTMarketplace.json";
import ERC1155ContractContractArtifacts from "../abis/LootmogulUser1155Token.json";
import tokenContractArtifacts from "../abis/token.json";
import TradeContractArtifacts from "../abis/Trade.json";
import TransferProxyContractArtifacts from "../abis/TransferProxy.json";
import StakingNFTContractArtifacts from "../abis/StakingNFT.json";

export function getContractsData(network) {
  let contractData = {};
  if (network == "Ethereum") {
    //address
    contractData.Factory721Contract = { "address": process.env.NEXT_PUBLIC_ETHEREUM_FACTORY721_CONTRACT_ADDRESS };
    contractData.Factory1155Contract = { "address": process.env.NEXT_PUBLIC_ETHEREUM_FACTORY1155_CONTRACT_ADDRESS };
    contractData.TradeContract = { "address": process.env.NEXT_PUBLIC_ETHEREUM_TRADE_CONTRACT_ADDRESS };
    contractData.TransferProxy = { "address": process.env.NEXT_PUBLIC_ETHEREUM_TRANSFER_PROXY_CONTRACT_ADDRESS };
    contractData.StakingContract = { "address": process.env.NEXT_PUBLIC_ETHEREUM_STAKING_CONTRACT_ADDRESS };
  } else if (network == "Polygon") {
    //address
    contractData.Factory721Contract = { "address": process.env.NEXT_PUBLIC_POLYGON_FACTORY721_CONTRACT_ADDRESS };
    contractData.Factory1155Contract = { "address": process.env.NEXT_PUBLIC_POLYGON_FACTORY1155_CONTRACT_ADDRESS };
    contractData.TradeContract = { "address": process.env.NEXT_PUBLIC_POLYGON_TRADE_CONTRACT_ADDRESS };
    contractData.TransferProxy = { "address": process.env.NEXT_PUBLIC_POLYGON_TRANSFER_PROXY_CONTRACT_ADDRESS };
    contractData.StakingContract = { "address": process.env.NEXT_PUBLIC_POLYGON_STAKING_CONTRACT_ADDRESS };
  } else if (network == "Binance") {
    //address
    contractData.Factory721Contract = { "address": process.env.NEXT_PUBLIC_BINANCE_FACTORY721_CONTRACT_ADDRESS };
    contractData.Factory1155Contract = { "address": process.env.NEXT_PUBLIC_BINANCE_FACTORY1155_CONTRACT_ADDRESS };
    contractData.TradeContract = { "address": process.env.NEXT_PUBLIC_BINANCE_TRADE_CONTRACT_ADDRESS };
    contractData.TransferProxy = { "address": process.env.NEXT_PUBLIC_BINANCE_TRANSFER_PROXY_CONTRACT_ADDRESS };
    contractData.StakingContract = { "address": process.env.NEXT_PUBLIC_BINANCE_STAKING_CONTRACT_ADDRESS };
  } else {
    return null;
  }

  //abi
  contractData.Factory721Contract.abi = Factory721ContractArtifacts.abi;
  contractData.Factory1155Contract.abi = Factory1155ContractArtifacts.abi;
  contractData.ERC721Contract = { "abi": ERC721ContractContractArtifacts.abi }; //require only abi
  contractData.ERC1155Contract = { "abi": ERC1155ContractContractArtifacts.abi }; //require only abi
  contractData.TokenContract = { "abi": tokenContractArtifacts.abi }; //require only abi
  contractData.TradeContract.abi = TradeContractArtifacts.abi;
  contractData.TransferProxy.abi = TransferProxyContractArtifacts.abi;
  contractData.StakingContract.abi = StakingNFTContractArtifacts.abi;
  return contractData;
}

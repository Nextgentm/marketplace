import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "./constants";
import Factory721Contract from "../contracts/json/Factory721.json";
import Factory1155Contract from "../contracts/json/Factory1155.json";
import ERC721Contract from "../contracts/json/erc721.json";
import ERC1155Contract from "../contracts/json/erc1155.json";
import TradeContract from "../contracts/json/trade.json";
import TransferProxy from "../contracts/json/TransferProxy.json";

const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";

//_______________________________________________//
// Get Contracts object
//_______________________________________________//
export async function getERC721FactoryContract(ethers, blockchainNetwork, signer) {
  // Pull the deployed contract instance
  const factoryContract721Factory = new ethers.Contract(
    Factory721Contract.address[blockchainNetwork],
    Factory721Contract.abi,
    signer
  );
  return factoryContract721Factory;
}

export async function getERC1155FactoryContract(ethers, blockchainNetwork, signer) {
  // Pull the deployed contract instance
  const factoryContract1155 = new ethers.Contract(
    Factory1155Contract.address[blockchainNetwork],
    Factory1155Contract.abi,
    signer
  );
  return factoryContract1155;
}

export async function getERC721Contract(ethers, contractAddress, signer) {
  // Pull the deployed contract instance
  const contract721 = new ethers.Contract(contractAddress, ERC721Contract.abi, signer);
  return contract721;
}

export async function getERC1155Contract(ethers, contractAddress, signer) {
  // Pull the deployed contract instance
  const contract1155 = new ethers.Contract(contractAddress, ERC1155Contract.abi, signer);
  return contract1155;
}

export async function getTradeContractContract(ethers, signer) {
  // Pull the deployed contract instance
  const tradeContract = new ethers.Contract(TradeContract.address, TradeContract.abi, signer);
  return tradeContract;
}

export async function getTransferProxyContract(ethers, signer) {
  // Pull the deployed contract instance
  const transferProxy = new ethers.Contract(TransferProxy.address, TransferProxy.abi, signer);
  return transferProxy;
}

//_______________________________________________//
// get value from smart contracts
//_______________________________________________//

export async function addressIsAdmin(ethers, walletAddress, blockchainNetwork, signer) {
  const factoryContract721 = await getERC721FactoryContract(ethers, blockchainNetwork, signer);
  // console.log(factoryContract721);
  const validationValue = await factoryContract721.hasRole(ADMIN_ROLE, walletAddress);
  return validationValue;
}

// ================================================//

//_______________________________________________//
// Network Helper functions
//_______________________________________________//
export async function switchNetwork(chainId) {
  if (parseInt(window.ethereum.networkVersion, 2) === parseInt(chainId, 2)) {
    console.log(`Network is already with chain id ${chainId}`);
    return true;
  }
  try {
    const res = await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });
    // console.log(res);
    return true;
  } catch (switchError) {
    console.log(switchError);
    // toast.error("Failed to change the network.");
  }
  return false;
}

export async function changeNetwork(networkType) {
  if (networkType === "Ethereum") {
    return switchNetwork(ETHEREUM_NETWORK_CHAIN_ID);
  }
  if (networkType === "Polygon") {
    return switchNetwork(POLYGON_NETWORK_CHAIN_ID);
  }
  return null;
}

//_______________________________________________//
// convert values
//_______________________________________________//
export function convertEthertoWei(ethers, value) {
  const amount = ethers.utils.parseUnits(value.toString(), "ether");
  return parseInt(amount._hex, 16).toString();
}

export function convertWeitoEther(ethers, weiValue) {
  return ethers.utils.formatEther(weiValue);
}

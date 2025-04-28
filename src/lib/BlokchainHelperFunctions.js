import { ethers } from "ethers";
import {
  ETHEREUM_NETWORK_CHAIN_ID,
  POLYGON_NETWORK_CHAIN_ID,
  BINANCE_NETWORK_CHAIN_ID,
  SOMNIA_NETWORK_CHAIN_ID,
  NETWORKS,
  NETWORKS_CHAINS,
  NETWORKS_DETAILS
} from "./constants";
import { getContractsData } from "./contractData";

const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";

//_______________________________________________//
// Get Contracts object
//_______________________________________________//
export async function getERC721FactoryContract(network) {
  try {
    console.log("Getting ERC721 factory contract for network:", network);
    if (!network) {
      console.error("Network parameter is undefined or null");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractData = getContractsData(network);

    if (!contractData?.Factory721Contract) {
      console.error("Factory721Contract data not found for network:", network);
      return null;
    }

    if (!contractData.Factory721Contract.address) {
      console.error("Factory721Contract address not found for network:", network);
      return null;
    }

    const factoryContract721Factory = new ethers.Contract(
      contractData.Factory721Contract.address,
      contractData.Factory721Contract.abi,
      signer
    );
    console.log("ERC721 factory contract initialized successfully");
    return factoryContract721Factory;
  } catch (error) {
    console.error("Error getting ERC721 factory contract:", error);
    return null;
  }
}

export async function getERC1155FactoryContract(network) {
  try {
    console.log("Getting ERC1155 factory contract for network:", network);
    if (!network) {
      console.error("Network parameter is undefined or null");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractData = getContractsData(network);

    if (!contractData?.Factory1155Contract) {
      console.error("Factory1155Contract data not found for network:", network);
      return null;
    }

    if (!contractData.Factory1155Contract.address) {
      console.error("Factory1155Contract address not found for network:", network);
      return null;
    }

    const factoryContract1155 = new ethers.Contract(
      contractData.Factory1155Contract.address,
      contractData.Factory1155Contract.abi,
      signer
    );
    console.log("ERC1155 factory contract initialized successfully");
    return factoryContract1155;
  } catch (error) {
    console.error("Error getting ERC1155 factory contract:", error);
    return null;
  }
}

export async function getERC721Contract(walletData, contractAddress) {
  // Pull the deployed contract instance
  if (walletData.contractData) {
    const signer = walletData.provider.getSigner();
    const contract721 = new walletData.ethers.Contract(
      contractAddress,
      walletData.contractData.ERC721Contract.abi,
      signer
    );
    return contract721;
  }
  return null;
}

export async function getERC1155Contract(walletData, contractAddress) {
  // Pull the deployed contract instance
  if (walletData.contractData) {
    const signer = walletData.provider.getSigner();
    const contract1155 = new walletData.ethers.Contract(
      contractAddress,
      walletData.contractData.ERC1155Contract.abi,
      signer
    );
    return contract1155;
  }
  return null;
}

export async function getTokenContract(walletData, contractAddress) {
  // Pull the deployed contract instance
  if (walletData.contractData) {
    const signer = walletData.provider.getSigner();
    const tokenContract = new walletData.ethers.Contract(
      contractAddress,
      walletData.contractData.TokenContract.abi,
      signer
    );
    return tokenContract;
  }
  return null;
}

export async function getTradeContract(walletData) {
  // Pull the deployed contract instance
  // console.log(walletData);
  if (walletData.contractData) {
    const signer = walletData.provider.getSigner();
    const tradeContract = new walletData.ethers.Contract(
      walletData.contractData.TradeContract.address,
      walletData.contractData.TradeContract.abi,
      signer
    );
    return tradeContract;
  }
  return null;
}

export async function getTransferProxyContract(walletData) {
  // Pull the deployed contract instance
  if (walletData.contractData) {
    const signer = walletData.provider.getSigner();
    const transferProxy = new walletData.ethers.Contract(
      walletData.contractData.TransferProxy.address,
      walletData.contractData.TransferProxy.abi,
      signer
    );
    return transferProxy;
  }
  return null;
}

export async function getStakingNFTContract(walletData) {
  // Pull the deployed contract instance
  if (walletData.contractData) {
    const signer = walletData.provider.getSigner();
    const stakingContract = new walletData.ethers.Contract(
      walletData.contractData.StakingContract.address,
      walletData.contractData.StakingContract.abi,
      signer
    );
    return stakingContract;
  }
  return null;
}
//_______________________________________________//
// get value from smart contracts
//_______________________________________________//

export async function getERC1155Balance(walletData, walletAddress, contractAddress, tokenId) {
  if (!walletAddress || !contractAddress) return false;
  const contract1155 = await getERC1155Contract(walletData, contractAddress);
  // console.log(walletData, walletAddress, contractAddress, tokenId);
  if (contract1155) {
    const balanceData = await contract1155.balanceOf(walletAddress, tokenId);
    // console.log(balanceData);
    const balance = parseInt(balanceData._hex, 16);
    return balance;
  }
  return 0;
}

export async function addressIsAdmin(walletData) {
  if (!walletData.isConnected && !walletData.account) return false;
  console.log("Checking admin status for network:", walletData.network);
  const factoryContract721 = await getERC721FactoryContract(walletData.network);
  console.log("Factory contract:", factoryContract721);
  if (factoryContract721) {
    const validationValue = await factoryContract721.hasRole(ADMIN_ROLE, walletData.account);
    console.log("Admin role check result:", validationValue);
    return validationValue;
  }
  return false;
}

export async function getStakingReward(walletData, walletAddress, NFTContractAddress, tokenId, index) {
  if (!walletAddress || !NFTContractAddress) return false;
  try {
    const stakingContract = await getStakingNFTContract(walletData);
    // console.log(walletData, walletAddress, NFTContractAddress, tokenId, index);
    if (stakingContract) {
      const balanceData = await stakingContract.calculateRewards(walletAddress, NFTContractAddress, tokenId, index);
      // console.log(balanceData);
      const balance = parseInt(balanceData._hex, 16);
      return balance;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
  return 0;
}

export async function getStakedBalances(walletData, walletAddress, NFTContractAddress, tokenId, index) {
  if (!walletAddress || !NFTContractAddress) return false;
  try {
    const stakingContract = await getStakingNFTContract(walletData);
    // console.log(walletData, walletAddress, NFTContractAddress, tokenId, index);
    if (stakingContract) {
      const balanceData = await stakingContract.stakedBalances(walletAddress, NFTContractAddress, tokenId, index);
      // console.log(balanceData.oldBalance);
      const balance = parseInt(balanceData.oldBalance._hex, 16);
      return balance;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
  return 0;
}

export async function getStakingRewardTokenDecimal(walletData) {
  try {
    const stakingContract = await getStakingNFTContract(walletData);
    if (stakingContract) {
      const erc20Address = await stakingContract.rewardToken();
      // console.log(erc20Address);
      const tokenContract = await getTokenContract(walletData, erc20Address);
      const decimals = await tokenContract.decimals();
      return decimals;
    }
  } catch (error) {
    console.log(error);
  }
  return 18;
}
// ================================================//

//_______________________________________________//
// Network Helper functions
//_______________________________________________//
export async function switchNetwork(chainId) {
  try {
    // Check if we're already on the correct network
    if (parseInt(window.ethereum.networkVersion, 2) === parseInt(chainId, 2)) {
      console.log(`Network is already with chain id ${chainId}`);
      return true;
    }

    // Try to switch network
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }]
      });
      console.log(`Successfully switched to network ${chainId}`);
      return true;
    } catch (switchError) {
      console.log("Switch error:", switchError);

      // If network is not added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the network to MetaMask
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORKS[chainId]]
          });
          console.log(`Successfully added network ${chainId}`);
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          throw new Error("Failed to add network to MetaMask");
        }
      }

      // If user rejected the request
      if (switchError.code === 4001) {
        throw new Error("User rejected network switch");
      }

      throw switchError;
    }
  } catch (error) {
    console.error("Network switch error:", error);
    throw error;
  }
}

// export async function changeNetwork(networkType) {
//   if (networkType === "Ethereum") {
//     return switchNetwork(ETHEREUM_NETWORK_CHAIN_ID);
//   }
//   if (networkType === "Polygon") {
//     return switchNetwork(POLYGON_NETWORK_CHAIN_ID);
//   }
//   return null;
// }

export function getNetworkNameByChainId(chainId) {
  console.log(
    " :blockChain :",
    chainId,
    Object.keys(NETWORKS_DETAILS).find((key) => NETWORKS_DETAILS[key] === "0xc488")
  );
  // return Object.keys(NETWORKS_DETAILS).find((key) => NETWORKS[key] === chainId);
  return Object.keys(NETWORKS_DETAILS).find((key) => NETWORKS_DETAILS[key] === "0xc488");
}

export function getChainIdByNetworkName(networkName) {
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
}

export function isValidNetwork(chainId) {
  if (Object.values(NETWORKS).includes(chainId)) {
    return true;
  }
  return false;
}

export const getNetworkSymbol = (currentNetwork) => {
  if (ETHEREUM_NETWORK_CHAIN_ID == currentNetwork) {
    return "ETH";
  } else if (POLYGON_NETWORK_CHAIN_ID == currentNetwork) {
    return "MATIC";
  } else if (BINANCE_NETWORK_CHAIN_ID == currentNetwork) {
    return "BNB";
  } else if (SOMNIA_NETWORK_CHAIN_ID == currentNetwork) {
    return "STT";
  }
  return "ETH";
};

export function currenyOfCurrentNetwork(currentNetwork) {
  if (ETHEREUM_NETWORK_CHAIN_ID == currentNetwork) {
    return "ETH";
  } else if (POLYGON_NETWORK_CHAIN_ID == currentNetwork) {
    return "MATIC";
  } else if (BINANCE_NETWORK_CHAIN_ID == currentNetwork) {
    return "BNB";
  } else if (SOMNIA_NETWORK_CHAIN_ID == currentNetwork) {
    return "STT";
  }
  return "";
}

export function validateInputAddresses(address) {
  return /^(0x){1}[0-9a-fA-F]{40}$/i.test(address);
}

export async function signMessage(provider, walletAddress, msg) {
  if (!provider) {
    throw new Error("Provider not connected");
  }
  const sig = await provider.send("personal_sign", [msg, walletAddress]);
  // console.log("Signature", sig);
  return sig;
}

export async function signLoginMessage(provider, ethers, walletAddress) {
  if (!provider) {
    throw new Error("Provider not connected");
  }
  const msg =
    "I want to login on Lootmogul at " +
    new Date().toISOString() +
    ". I accept the Lootmogul Terms of Service and I am at least 13 years old.";
  const sig = await provider.send("personal_sign", [msg, walletAddress]);
  // console.log("Signature", sig);
  const isValid = (await ethers.utils.verifyMessage(msg, sig)) === ethers.utils.getAddress(walletAddress);
  // console.log("isValid", isValid);
  return isValid;
}

export function getDateForSolidity(_date) {
  if (!_date) {
    throw new Error("invalid date");
  }
  const date = new Date(_date);
  return Math.floor(date.getTime() / 1000);
}

// pass js seconds = sec/1000 and solidity seconds = sec
export function secondsToHumanReadableString(seconds) {
  let result = "";
  let numyears = Math.floor(seconds / 31536000);
  let numdays = Math.floor((seconds % 31536000) / 86400);
  let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  let numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
  if (numyears > 0) {
    result += numyears + " years ";
  }
  if (numdays > 0) {
    result += numdays + " days ";
  }
  if (numhours > 0) {
    result += numhours + " hours ";
  }
  if (numminutes > 0) {
    result += numminutes + " minutes ";
  }
  if (numseconds > 0) {
    result += numseconds + " seconds ";
  }
  return result;
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

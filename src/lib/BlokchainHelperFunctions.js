import {
  ETHEREUM_NETWORK_CHAIN_ID,
  POLYGON_NETWORK_CHAIN_ID,
  NETWORKS,
  NETWORKS_CHAINS,
  BINANCE_NETWORK_CHAIN_ID
} from "./constants";

const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";

//_______________________________________________//
// Get Contracts object
//_______________________________________________//
export async function getERC721FactoryContract(walletData) {
  // Pull the deployed contract instance
  if (walletData.contractData) {
    const signer = walletData.provider.getSigner();

    const factoryContract721Factory = new walletData.ethers.Contract(
      walletData.contractData.Factory721Contract.address,
      walletData.contractData.Factory721Contract.abi,
      signer
    );
    return factoryContract721Factory;
    // } else if(walletData.network){ // incase if contractData is not loaded
    //   const contractData = getContractsData(walletData.network);
    //   const signer = walletData.provider.getSigner();
    //   const factoryContract721Factory = new walletData.ethers.Contract(
    //     contractData.Factory721Contract.address,
    //     contractData.Factory721Contract.abi,
    //     signer
    //   );
    //   return factoryContract721Factory;
  }
  return null;
}

export async function getERC1155FactoryContract(walletData) {
  // Pull the deployed contract instance
  if (walletData.contractData) {
    const signer = walletData.provider.getSigner();
    const factoryContract1155 = new walletData.ethers.Contract(
      walletData.contractData.Factory1155Contract.address,
      walletData.contractData.Factory1155Contract.abi,
      signer
    );
    return factoryContract1155;
  }
  return null;
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
  console.log(walletData);
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
  const factoryContract721 = await getERC721FactoryContract(walletData);
  // console.log(factoryContract721);
  if (factoryContract721) {
    const validationValue = await factoryContract721.hasRole(ADMIN_ROLE, walletData.account);
    return validationValue;
  }
  return false;
}

// ================================================//

//_______________________________________________//
// Network Helper functions
//_______________________________________________//
export async function switchNetwork(chainId) {
  try {
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
      if (switchError.code === 4001) {
        console.log("Network change request closed");
      }
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORKS_CHAINS[chainId]]
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.log(switchError);
      // toast.error("Failed to change the network.");
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
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
  return Object.keys(NETWORKS).find((key) => NETWORKS[key] === chainId);
}

export function getChainIdByNetworkName(networkName) {
  return NETWORKS[networkName];
}

export function isValidNetwork(chainId) {
  if (Object.values(NETWORKS).includes(chainId)) {
    return true;
  }
  return false;
}

export function currenyOfCurrentNetwork(currentNetwork) {
  if (ETHEREUM_NETWORK_CHAIN_ID == currentNetwork) {
    return "ETH";
  } else if (POLYGON_NETWORK_CHAIN_ID == currentNetwork) {
    return "MATIC";
  } else if (BINANCE_NETWORK_CHAIN_ID == currentNetwork) {
    return "BNB";
  }
  return "";
}

export function validateInputAddresses(address) {
  return /^(0x){1}[0-9a-fA-F]{40}$/i.test(address);
}

export async function signMessage(provider, ethers, walletAddress) {
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

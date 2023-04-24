import {
    ETHEREUM_NETWORK_CHAIN_ID,
    POLYGON_NETWORK_CHAIN_ID,
} from "./constants";
import ERC721Contract from "../contracts/json/erc721.json";
import ERC1155Contract from "../contracts/json/erc1155.json";
import TradeContract from "../contracts/json/trade.json";
import TransferProxy from "../contracts/json/TransferProxy.json";

// Get Contracts
export async function getERC721Contract(ethers, contractAddress, signer) {
    // Pull the deployed contract instance
    const contract721 = new ethers.Contract(
        contractAddress,
        ERC721Contract.abi,
        signer
    );
    return contract721;
}

export async function getERC1155Contract(ethers, contractAddress, signer) {
    // Pull the deployed contract instance
    const contract1155 = new ethers.Contract(
        contractAddress,
        ERC1155Contract.abi,
        signer
    );
    return contract1155;
}

export async function getTradeContractContract(ethers, signer) {
    // Pull the deployed contract instance
    const tradeContract = new ethers.Contract(
        TradeContract.address,
        TradeContract.abi,
        signer
    );
    return tradeContract;
}

export async function getTransferProxyContract(ethers, signer) {
    // Pull the deployed contract instance
    const transferProxy = new ethers.Contract(
        TransferProxy.address,
        TransferProxy.abi,
        signer
    );
    return transferProxy;
}

// Network Helper functions
export async function switchNetwork(chainId) {
    if (parseInt(window.ethereum.networkVersion, 2) === parseInt(chainId, 2)) {
        console.log(`Network is already with chain id ${chainId}`);
        return true;
    }
    try {
        const res = await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
        });
        // console.log(res);
        return true;
    } catch (switchError) {
        // console.log(switchError);
        toast.error("Failed to change the network.");
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

import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "../../lib/constants";
import { switchNetwork } from "../../lib/BlokchainHelperFunctions";
import { ethers } from "ethers";

//_______________________________________________//
// Wallet Helper functions
//_______________________________________________//

export async function onConnect(setWalletData, setEthBalance, setIsAuthenticated) {
  try {
    // const currentProvider = detectCurrentProvider();
    // if (currentProvider) {
    //     await currentProvider.request({
    //         method: "eth_requestAccounts",
    //     });
    //     const web3 = new Web3(currentProvider);
    //     const userAccount = await web3.eth.getAccounts();
    //     const account = userAccount[0];
    //     const getEthBalance = await web3.eth.getBalance(account);
    if (!(await switchNetwork(POLYGON_NETWORK_CHAIN_ID))) {
      // polygon testnet
      toast.error("Change network first");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const accounts = await provider.send("eth_requestAccounts", []);
    const balance = await provider.getBalance(accounts[0]);
    const getEthBalance = ethers.utils.formatEther(balance);
    // console.log(signer);
    setWalletData({
      provider,
      account: accounts[0],
      balance: getEthBalance,
      ethers,
      isConnected: true
    });
    // console.log(walletData);
    if (setEthBalance) setEthBalance(getEthBalance);
    if (setIsAuthenticated) setIsAuthenticated(walletData.isConnected);
    // }
  } catch (err) {
    console.log(err);
    localStorage.setItem("isWalletConnected", false);
  }
}

export const onDisconnectWallet = (setWalletData, setIsAuthenticated) => {
  setWalletData({
    provider: null,
    accounts: null,
    balance: null,
    ethers,
    isConnected: false
  });
  setIsAuthenticated(false);
};

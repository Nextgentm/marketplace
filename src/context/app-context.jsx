import ConnectWallets from "@components/modals/connect-wallets";
import { isServer } from "@utils/methods";
import { useRouter } from "next/router";
import { createContext, useState, useMemo, useEffect, useRef } from "react";
import { doLogOut, userSessionData } from "src/lib/user";
import { ethers } from "ethers";
import { POLYGON_NETWORK_CHAIN_ID, NETWORKS, ETHEREUM_NETWORK_CHAIN_ID, BINANCE_NETWORK_CHAIN_ID, NETWORKS_CHAINS } from "src/lib/constants";
import { toast } from "react-toastify";
import { currenyOfCurrentNetwork, getNetworkNameByChainId, getChainIdByNetworkName, isValidNetwork, switchNetwork } from "src/lib/BlokchainHelperFunctions";
import SwitchNetwork from "@components/modals/switch-network";
import { getContractsData } from "src/lib/contractData";
import { Messages } from "@utils/constants";
import strapi from "@utils/strapi";
import { setCookie } from "@utils/cookies";

export const AppData = createContext(null);

const AppDataContext = ({ children }) => {
  const router = useRouter();
  const [walletData, setWalletData] = useState({
    provider: null,
    account: null,
    balance: null,
    ethers: null,
    isConnected: false,
    network: null,
    chainId: null,
    contractData: null
  });

  const [userData, setUserData] = useState();
  const [showConnectWalletModel, setShowConnectWalletModel] = useState(false);
  const [showChangeNetworkModel, setShowChangeNetworkModel] = useState(false);
  const [ethBalance, setEthBalance] = useState("");
  // const [redirectionUrl, setRedirectionUrl] = useState(null);
  // const [callbackMethod, setCallbackMethod] = useState(null);
  const [isAuthenticatedCryptoWallet, setIsAuthenticatedCryptoWallet] = useState(false);

  // For acount change event handle using useRef
  const [account, _setAccount] = useState("");
  const accountRef = useRef(account);
  function setAccount(data) {
    accountRef.current = data; // Updates the ref
    _setAccount(data);
  }

  // For network change event handle using useRef
  const [currentNetwork, _setCurrentNetwork] = useState();
  const currentNetworkRef = useRef(currentNetwork);
  function setCurrentNetwork(data) {
    currentNetworkRef.current = data; // Updates the ref
    _setCurrentNetwork(data);
  }

  const changeNetwork = async (_chainId) => {
    try {
      const { chainId } = await walletData.provider.getNetwork();
      if (!await switchNetwork(_chainId)) {
        // polygon testnet
        _chainId = "0x" + chainId.toString(16);
        _setCurrentNetwork(_chainId);
        toast.error(Messages.ALLOW_NETWORK_CHANGE_REQUEST);
        return;
      }
    } catch (error) {

    }
  }

  const handleChangeNetworkSubmit = async (event) => {
    event.preventDefault();
    let networkids = event.target.networkid;
    let network = "";
    for (let i = 0; i < networkids.length; i++) {
      if (networkids[i].checked) {
        network = networkids[i].value;
      }
    }
    console.log(network);
    if (network) {
      const chainId = getChainIdByNetworkName(network);
      if (chainId) {
        await switchNetwork(chainId);
        _setCurrentNetwork(chainId);
        setShowChangeNetworkModel(false);
      }
      // console.log(wallet);
    }
  };

  useEffect(() => {
    (async () => await loadUserData())();
    console.log("*-*-*-*-*-*appcontext");
  }, [router.asPath]);

  const loadUserData = async () => {
    const { isAuthenticated } = await userSessionData();
    if (!isServer() && isAuthenticated) {
      const user = JSON.parse(localStorage.getItem("user"));
      setUserData(user);
    } else if (!isAuthenticated) setUserData();
  };

  const setUserLikeData = async (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUserData(user);
  }

  const setUserDataLocal = (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      loadUserData;
    }
  };

  //Metamask wallet 
  useEffect(() => {
    if (walletData.isConnected) {
      setWalletData({ ...walletData, account: account });
      updateBalance();
    }
  }, [account])

  // useEffect(() => {
  //   if (walletData.isConnected && currentNetwork) {
  //     changeNetwork(currentNetwork);
  //     localStorage.setItem("currentNetwork", currentNetwork);
  //   }
  // }, [currentNetwork])

  useEffect(() => {
    if (window?.ethereum) {
      /* code for runtime metamask events */
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          onDisconnectWallet();
        }
      };

      // const handleChainChanged = (_hexChainId) => {
      //   if (isValidNetwork(_hexChainId)) {
      //     setCurrentNetwork(_hexChainId);
      //     directConnect();
      //   } else {
      //     onDisconnectWallet();
      //   }
      // };

      // const handleDisconnect = (error) => {
      //   console.log("disconnect", error);
      //   onDisconnectWallet();
      // };

      let provider = window?.ethereum;
      if (window.ethereum.providers?.length) {
        window.ethereum.providers.forEach(async (p) => {
          if (p.isMetaMask) provider = p;
        });
      }
      // const provider2 = new ethers.providers.Web3Provider(provider);
      provider?.on("accountsChanged", handleAccountsChanged);
      // window?.ethereum?.on("chainChanged", handleChainChanged);
      // window.ethereum.on("disconnect", handleDisconnect);
      // check if previously connected
      if (localStorage?.getItem("isWalletConnected") === "true") {
        if (isPreviouslyConnected()) {
          // const oldChainId = localStorage?.getItem("currentNetwork");
          // _setCurrentNetwork(oldChainId);
          directConnect();
        } else {
          localStorage.setItem("isWalletConnected", false);
        }
      }
      // Render wallet details
      setIsAuthenticatedCryptoWallet(walletData.isConnected);
      if (walletData.isConnected) {
        setEthBalance(walletData.balance);
      }
    }
  }, []);


  const updateBalance = async () => {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const accounts = await provider.send("eth_requestAccounts", []);
    const balance = await provider.getBalance(accounts[0]);
    const getEthBalance = ethers.utils.formatEther(balance);
    setEthBalance(getEthBalance);
  }

  const isPreviouslyConnected = async () => {
    const provider = await getProvider();
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  };

  const getProvider = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      if (window.ethereum.providers?.length) {
        let provider;
        window.ethereum.providers.forEach(async (p) => {
          if (p.isMetaMask) provider = p;
        });
        // if (!provider) {
        // const metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);
        const provider2 = new ethers.providers.Web3Provider(provider);// only use in local give error on live //new ethers.providers.Web3Provider(window.ethereum, "any")
        // }
        return provider2;
      } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);// only use in local give error on live //new ethers.providers.Web3Provider(window.ethereum, "any")
        return provider;
      }
    }
    return null;
  }

  const directConnect = async () => {
    try {
      if (!checkBrowesrSupport()) {
        return false;
      }
      const provider = await getProvider();
      const { chainId } = await provider.getNetwork();
      let _chainId = "0x" + chainId.toString(16);
      const _currentNetwork = getNetworkNameByChainId(_chainId);
      const signer = provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      const balance = await provider.getBalance(accounts[0]);
      const getEthBalance = ethers.utils.formatEther(balance);
      const allContractData = getContractsData(_currentNetwork);
      // console.log(signer);
      setWalletData({
        provider,
        account: accounts[0],
        balance: getEthBalance,
        ethers,
        isConnected: true,
        network: _currentNetwork,
        chainId: _chainId,
        contractData: allContractData
      });
      // console.log(walletData);
      setEthBalance(getEthBalance);
      setIsAuthenticatedCryptoWallet(walletData.isConnected);
      setShowConnectWalletModel(false);
      localStorage.setItem("isWalletConnected", true);
      // }
    } catch (err) {
      console.log(err);
      localStorage.setItem("isWalletConnected", false);
    }
  };

  const onDisconnectWallet = async () => {
    setWalletData({
      provider: null,
      accounts: null,
      balance: null,
      ethers,
      isConnected: false,
      network: null,
      chainId: null,
      contractData: null
    });
    localStorage.setItem("isWalletConnected", false);
    setIsAuthenticatedCryptoWallet(false);
  };

  const onSignout = async () => {
    onDisconnectWallet();
    await doLogOut();
    await loadUserData();
    router.push("/");
  };

  const switchNetwork = async (chainId) => {
    try {
      let provider = window?.ethereum;
      if (window.ethereum.providers?.length) {
        window.ethereum.providers.forEach(async (p) => {
          if (p.isMetaMask) provider = p;
        });
      }
      if (parseInt(provider.networkVersion, 2) === parseInt(chainId, 2)) {
        console.log(`Network is already with chain id ${chainId}`);
        await directConnect();
        return true;
      }
      try {
        const res = await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }]
        });
        // console.log(res);
        await directConnect();
        return true;
      } catch (switchError) {
        if (switchError.code === 4001) {
          console.log("Network change request closed");
        }
        if (switchError.code === 4902) {
          try {
            await provider.request({
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

  const changeNetworkByNetworkType = async (networkType) => {
    const chainId = getChainIdByNetworkName(networkType);
    if (chainId) {
      return await switchNetwork(chainId);
    }
    return null;
  }

  const handleConnectWalletSubmit = async (event) => {
    event.preventDefault();
    // Wallet connect
    let walletids = event.target.walletid;
    let wallet = "";
    for (let i = 0; i < walletids.length; i++) {
      if (walletids[i].checked) {
        wallet = walletids[i].value;
      }
    }
    // console.log(wallet);
    // if (wallet == "MetaMask") {
    await onConnect();
    // }

    // Change network if required
    let networkids = event.target.networkid;
    let network = "";
    for (let i = 0; i < networkids.length; i++) {
      if (networkids[i].checked) {
        network = networkids[i].value;
      }
    }
    console.log(network);
    if (network) {
      const chainId = getChainIdByNetworkName(network);
      if (chainId) {
        await switchNetwork(chainId);
        _setCurrentNetwork(chainId);
      }
    }
  };

  // Check wether the user browser supports had ethereum (crypto wallet) support
  const checkBrowesrSupport = () => {
    if (window?.ethereum) {
      return true;
    }
    toast.error(Messages.NO_METAMASK_WALLET);
    return false;
  }

  const onConnect = async () => {
    try {
      if (!checkBrowesrSupport()) {
        return false;
      }
      const provider = await getProvider();
      // console.log("provider", provider);
      if (!provider) { toast.error("Error while connecting wallet"); return; }
      // console.log("calling account");
      const accounts = await provider.send("eth_requestAccounts", []);
      // console.log("called account", account);
      if (currentNetwork) {
        if (!await switchNetwork(currentNetwork)) {
          // polygon testnet
          toast.error(Messages.ALLOW_NETWORK_CHANGE_REQUEST);
          return false;
        }
      }
      const { chainId } = await provider.getNetwork();
      let _chainId = "0x" + chainId.toString(16);
      const _currentNetwork = getNetworkNameByChainId(_chainId);
      const signer = provider.getSigner();
      const balance = await provider.getBalance(accounts[0]);
      const getEthBalance = ethers.utils.formatEther(balance);
      const allContractData = getContractsData(_currentNetwork);
      // console.log(signer);
      setWalletData({
        provider,
        account: accounts[0],
        balance: getEthBalance,
        ethers,
        isConnected: true,
        network: _currentNetwork,
        chainId: _chainId,
        contractData: allContractData
      });
      localStorage.setItem("isWalletConnected", true);
      // console.log(walletData);
      setEthBalance(getEthBalance);
      setIsAuthenticatedCryptoWallet(walletData.isConnected);
      setShowConnectWalletModel(false);
      return true;
    } catch (err) {
      console.log(err);
      toast.error(err?.message ? `Metamask Error: ${err?.message}` : Messages.WALLET_CONNECT_FAILED);
      localStorage.setItem("isWalletConnected", false);
      return false;
    }
  };

  const checkAndConnectWallet = async (network) => {
    console.log("checkAndConnectWallet", network);
    console.log(walletData.isConnected);
    console.log(!(walletData.network == network));
    if (!walletData.isConnected || !(walletData.network == network)) {
      let supportCheck = checkBrowesrSupport();
      if (supportCheck && network) {
        let isConnected = await onConnect(network);
        if (isConnected) {
          const chainId = getChainIdByNetworkName(network);
          if (chainId) {
            let res = await switchNetwork(chainId);
            if (res) {
              _setCurrentNetwork(chainId);
              return res;
            } else {
              toast.error(Messages.WALLET_NETWORK_CHNAGE_FAILED);
              return false;
            }
          }
        }
      }
    } else {
      return true;
    }
  }

  const value = useMemo(
    () => ({
      walletData,
      setWalletData,
      loadUserData,
      setUserLikeData,
      userData,
      // redirectionUrl,
      // setRedirectionUrl,
      // callbackMethod,
      // setCallbackMethod,
      showConnectWalletModel,
      setShowConnectWalletModel,
      showChangeNetworkModel,
      setShowChangeNetworkModel,
      currentNetwork,
      directConnect,
      onConnect,
      onDisconnectWallet,
      onSignout,
      ethBalance,
      changeNetworkByNetworkType,
      checkAndConnectWallet,

      isAuthenticatedCryptoWallet,
      setIsAuthenticatedCryptoWallet,
      setUserData,
      setUserDataLocal
    }),
    [walletData, userData, isAuthenticatedCryptoWallet]
  );
  return <AppData.Provider value={value}>
    {children}
    <ConnectWallets show={showConnectWalletModel} handleModal={(prev) => setShowConnectWalletModel(!prev)} handleSubmit={handleConnectWalletSubmit} />
    <SwitchNetwork show={showChangeNetworkModel} handleModal={(prev) => setShowChangeNetworkModel(!prev)} handleSubmit={handleChangeNetworkSubmit} />
  </AppData.Provider>;
};

export default AppDataContext;
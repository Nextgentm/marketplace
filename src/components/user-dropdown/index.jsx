import Image from "next/image";
import Anchor from "@ui/anchor";
import { useEffect, useContext, useState, useRef } from "react";
import { AppData } from "src/context/app-context";
import { ethers } from "ethers";
import Button from "@ui/button";
import { doLogOut } from "src/lib/user";
import { useRouter } from "next/router";
import { POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import { toast } from "react-toastify";
import { switchNetwork } from "src/lib/BlokchainHelperFunctions";
import { walletAddressShortForm } from "../../utils/blockchain";

const UserDropdown = () => {
  const router = useRouter();
  const {
    userData,
    setWalletData,
    walletData,
    loadUserData,
    isAuthenticatedCryptoWallet,
    setIsAuthenticatedCryptoWallet
  } = useContext(AppData);
  const [ethBalance, setEthBalance] = useState("");
  // For acount change event handle using useRef
  const [account, _setAccount] = useState("");
  const accountRef = useRef(account);
  function setAccount(data) {
    accountRef.current = data; // Updates the ref
    _setAccount(data);
  }

  useEffect(() => {
    if (walletData.isConnected)
      setWalletData({ ...walletData, account: account });
  }, [account])

  useEffect(() => {
    /* code for runtime metamask events */
    const handleAccountsChanged = (accounts) => {
      // console.log("accountsChanged", accounts);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        onDisconnectWallet();
        console.log("No accounts connected");
      }
    };

    // const handleChainChanged = (_hexChainId) => {
    //   console.log(_hexChainId);
    // };

    // const handleDisconnect = (error) => {
    //   console.log("disconnect", error);
    //   onDisconnectWallet();
    // };

    window?.ethereum?.on("accountsChanged", handleAccountsChanged);
    // window.ethereum.on("chainChanged", handleChainChanged);
    // window.ethereum.on("disconnect", handleDisconnect);
    // check if previously connected
    if (localStorage?.getItem("isWalletConnected") === "true") {
      if (isPreviouslyConnected()) {
        onConnect();
      } else {
        localStorage.setItem("isWalletConnected", false);
      }
    }
    // Render wallet details
    setIsAuthenticatedCryptoWallet(walletData.isConnected);
    if (walletData.isConnected) {
      setEthBalance(walletData.balance);
    }
  }, []);

  const isPreviouslyConnected = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  };

  const onConnect = async () => {
    try {
      if (!await switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
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
      localStorage.setItem("isWalletConnected", true);
      // console.log(walletData);
      setEthBalance(getEthBalance);
      setIsAuthenticatedCryptoWallet(walletData.isConnected);
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
      isConnected: false
    });
    localStorage.setItem("isWalletConnected", false);
    setIsAuthenticatedCryptoWallet(false);
  };

  const onDisconnect = async () => {
    setWalletData({
      provider: null,
      accounts: null,
      balance: null,
      ethers,
      isConnected: false
    });
    localStorage.setItem("isWalletConnected", false);
    setIsAuthenticatedCryptoWallet(false);
    await doLogOut();
    await loadUserData();
    router.push("/");
  };

  return (
    <div className="icon-box">
      <Anchor path="/author">
        {userData?.photoURL ? (
          <img src={userData?.photoURL} alt="Images" width={38} height={38} />
        ) : (
          <Image src="/images/icons/boy-avater.png" alt="Images" width={38} height={38} />
        )}
      </Anchor>
      <div className="rn-dropdown">
        <div className="rn-inner-top">
          <h4 className="title">
            <Anchor path="/product">{userData?.fullName || userData?.username || userData.email}</Anchor>
          </h4>
          <span>
            <Anchor path="#">{walletData.isConnected && walletAddressShortForm(walletData.account)}</Anchor>
          </span>
        </div>
        {!walletData.isConnected && (
          <div className="setting-option header-btn">
            <Button color="primary" className="connectBtn" onClick={onConnect} fullwidth="true">
              Wallet Connect
            </Button>
          </div>
        )}
        {walletData.isConnected && (
          <>
            <div className="rn-product-inner">
              <ul className="product-list">
                <li className="single-product-list">
                  <div className="thumbnail">
                    <Anchor path="/product">
                      <Image src="/images/portfolio/portfolio-07.jpg" alt="Nft Product Images" width={50} height={50} />
                    </Anchor>
                  </div>
                  <div className="content">
                    <h6 className="title">
                      <Anchor path="/product">Balance</Anchor>
                    </h6>
                    <span className="price">{ethBalance} ETH</span>
                  </div>
                  <div className="button" />
                </li>
                <li className="single-product-list">
                  <div className="thumbnail">
                    <Anchor path="/product">
                      <Image src="/images/portfolio/portfolio-01.jpg" alt="Nft Product Images" width={50} height={50} />
                    </Anchor>
                  </div>
                  <div className="content">
                    <h6 className="title">
                      <Anchor path="/product">Balance</Anchor>
                    </h6>
                    <span className="price">{ethBalance} ETH</span>
                  </div>
                  <div className="button" />
                </li>
              </ul>
            </div>
            <div className="add-fund-button mt--20 pb--20">
              <Button className="w-100" onClick={onDisconnectWallet}>
                Disconnect Wallet
              </Button>
              {/* <Anchor className="btn btn-primary-alta w-100" path="/connect">
                Add Your More Funds
              </Anchor> */}
            </div>
          </>
        )}

        <ul className="list-inner">
          <li>
            <Anchor path="/author">My Profile</Anchor>
          </li>
          <li>
            <Anchor path="/edit-profile">Edit Profile</Anchor>
          </li>
          <li>
            <button type="button" onClick={onDisconnect}>
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserDropdown;

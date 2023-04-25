/* eslint-disable no-console */
import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Web3 from "web3";
import Logo from "@components/logo";
import MainMenu from "@components/menu/main-menu";
import MobileMenu from "@components/menu/mobile-menu";
import SearchForm from "@components/search-form/layout-01";
import FlyoutSearchForm from "@components/search-form/layout-02";
import UserDropdown from "@components/user-dropdown";
import ColorSwitcher from "@components/color-switcher";
import BurgerButton from "@ui/burger-button";
import Anchor from "@ui/anchor";
import Button from "@ui/button";
import { useOffcanvas, useSticky, useFlyoutSearch } from "@hooks";
import { WalletData } from "src/context/wallet-context";
import { ethers } from "ethers";
import headerData from "../../../data/general/header-01.json";
import menuData from "../../../data/general/menu-01.json";

const Header = ({ className }) => {
  const sticky = useSticky();
  const { offcanvas, offcanvasHandler } = useOffcanvas();
  const { search, searchHandler } = useFlyoutSearch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ethBalance, setEthBalance] = useState("");

  const { walletData, setWalletData } = useContext(WalletData);

  useEffect(() => {
    /* code for runtime metamask events */
    /* const handleAccountsChanged = (accounts) => {
            console.log("accountsChanged", accounts);
            if (accounts) setAccount(accounts[0]);
        };

        const handleChainChanged = (_hexChainId) => {
            setChainId(_hexChainId);
        };

        const handleDisconnect = () => {
            console.log("disconnect", error);
            disconnect();
        };

        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);
        provider.on("disconnect", handleDisconnect);
        */

    // check if previously connected
    // if (isPreviouslyConnected()) {
    //     onConnect();
    // }
    // Render wallet details
    setIsAuthenticated(walletData.isConnected);
    if (walletData.isConnected) {
      setEthBalance(walletData.balance);
    }
  }, [ethBalance]);

  const detectCurrentProvider = () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      console.log("Non-ethereum browser detected. You should install Metamask");
    }
    return provider;
  };

  const isPreviouslyConnected = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  };

  const switchNetwork = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const res = await provider.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(97) }]
      });
      console.log(res);
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await provider.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[toHex(network)]]
          });
        } catch (error) {
          setError(error);
        }
      }
      return false;
    }
  };

  const onConnect = async () => {
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
      setEthBalance(getEthBalance);
      setIsAuthenticated(walletData.isConnected);
      // }
    } catch (err) {
      console.log(err);
    }
  };

  const onDisconnect = () => {
    setWalletData({
      provider: null,
      accounts: null,
      balance: null,
      ethers,
      isConnected: false
    });
    setIsAuthenticated(false);
  };

  return (
    <>
      <header
        className={clsx(
          "rn-header haeder-default black-logo-version header--fixed header--sticky",
          sticky && "sticky",
          className
        )}
      >
        <div className="container">
          <div className="header-inner">
            <div className="header-left">
              <Logo logo={headerData.logo} />
              <div className="mainmenu-wrapper">
                <nav id="sideNav" className="mainmenu-nav d-none d-xl-block">
                  <MainMenu menu={menuData} />
                </nav>
              </div>
            </div>
            <div className="header-right">
              <div className="setting-option d-none d-lg-block">
                <SearchForm />
              </div>
              <div className="setting-option rn-icon-list d-block d-lg-none">
                <div className="icon-box search-mobile-icon">
                  <button type="button" aria-label="Click here to open search form" onClick={searchHandler}>
                    <i className="feather-search" />
                  </button>
                </div>
                <FlyoutSearchForm isOpen={search} />
              </div>
              {!isAuthenticated && (
                <div className="setting-option header-btn">
                  <div className="icon-box">
                    <Button color="primary" className="connectBtn" size="small" onClick={onConnect}>
                      Wallet connect
                    </Button>
                  </div>
                </div>
              )}
              {isAuthenticated && (
                <div className="setting-option rn-icon-list user-account">
                  <UserDropdown onDisconnect={onDisconnect} ethBalance={ethBalance} />
                </div>
              )}
              <div className="setting-option rn-icon-list notification-badge">
                <div className="icon-box">
                  <Anchor path={headerData.activity_link}>
                    <i className="feather-bell" />
                    <span className="badge">6</span>
                  </Anchor>
                </div>
              </div>
              <div className="setting-option mobile-menu-bar d-block d-xl-none">
                <div className="hamberger">
                  <BurgerButton onClick={offcanvasHandler} />
                </div>
              </div>
              <div id="my_switcher" className="setting-option my_switcher">
                <ColorSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={offcanvas} onClick={offcanvasHandler} menu={menuData} logo={headerData.logo} />
    </>
  );
};

Header.propTypes = {
  className: PropTypes.string
};

export default Header;

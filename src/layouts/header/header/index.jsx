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
import { AppData } from "src/context/app-context";
import { ethers } from "ethers";
import headerData from "../../../data/general/header-01.json";
import menuData from "../../../data/general/menu-01.json";
import Link from "next/link";
import { authenticationData } from "src/graphql/reactive/authentication";
import { addressIsAdmin, getChainIdByNetworkName, switchNetwork } from "src/lib/BlokchainHelperFunctions";
import { DEFAULT_NETWORK } from "src/lib/constants";
import { networksList } from "@utils/wallet";

const Header = ({ className }) => {
  const sticky = useSticky();
  const { offcanvas, offcanvasHandler } = useOffcanvas();
  const { search, searchHandler } = useFlyoutSearch();

  const { walletData, setWalletData, userData } = useContext(AppData);

  const [isAdminWallet, setIsAdminWallet] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(walletData.network ? walletData.network : DEFAULT_NETWORK);

  useEffect(() => {
    if (walletData.isConnected) {
      addressIsAdmin(walletData).then((validationValue) => {
        setIsAdminWallet(validationValue);
      }).catch((error) => { console.log("Error while factory call " + error) });
    } else {
      setIsAdminWallet(false);
    }
  }, [walletData]);


  useEffect(() => {
    if (walletData.network) {
      setCurrentNetwork(walletData.network);
    }
  }, [walletData.network]);

  useEffect(() => {
    if (walletData.isConnected) {
      if (currentNetwork) {
        const chainId = getChainIdByNetworkName(currentNetwork);
        if (chainId) {
          switchNetwork(chainId);
        }
      }
    }
  }, [currentNetwork]);

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
                  <MainMenu menu={menuData} isAdmin={isAdminWallet} />
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
              {!userData && (
                <div className="setting-option header-btn">
                  <div className="icon-box">
                    <Link href="/login">
                      <Button color="primary" className="connectBtn" size="small">
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              {/* {!isAuthenticated && userData && (
                <div className="setting-option header-btn">
                  <div className="icon-box">
                    <Button color="primary" className="connectBtn" size="small" onClick={onConnect}>
                      Wallet Connect
                    </Button>
                  </div>
                </div>
              )} */}
              {userData && (
                <div className="setting-option rn-icon-list user-account">
                  <UserDropdown />
                </div>
              )}
              <div className="setting-option current-network">
                <select id="current-wallet-network" onChange={(event) => setCurrentNetwork(event.target.value)} value={currentNetwork}>
                  {walletData.isConnected ? networksList.map((ele, index) =>
                    <option key={index} value={ele.name}>{ele.name}</option>
                  ) : <option value={DEFAULT_NETWORK}>{DEFAULT_NETWORK}</option>
                  }
                </select>
                {/* <Button size="small">
                  {walletData.isConnected ? walletData.network : DEFAULT_NETWORK}
                </Button> */}
              </div>
              {/* <div className="setting-option rn-icon-list notification-badge">
                <div className="icon-box">
                  <Anchor path={headerData.activity_link}>
                    <i className="feather-bell" />
                    <span className="badge">6</span>
                  </Anchor>
                </div>
              </div> */}
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
      <MobileMenu
        isOpen={offcanvas}
        onClick={offcanvasHandler}
        menu={menuData}
        logo={headerData.logo}
        isAdmin={isAdminWallet}
      />
    </>
  );
};

Header.propTypes = {
  className: PropTypes.string
};

export default Header;

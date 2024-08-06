import Image from "next/image";
import Anchor from "@ui/anchor";
import { useEffect, useContext, useState, useRef } from "react";
import { AppData } from "src/context/app-context";
import Button from "@ui/button";
import { useRouter } from "next/router";
import { currenyOfCurrentNetwork, getNetworkNameByChainId, getChainIdByNetworkName, isValidNetwork, switchNetwork } from "src/lib/BlokchainHelperFunctions";
import { walletAddressShortForm } from "../../utils/blockchain";

const UserDropdown = () => {
  const router = useRouter();
  const {
    userData,
    walletData,
    setShowConnectWalletModel,
    setShowChangeNetworkModel,
    currentNetwork,
    onDisconnectWallet,
    onSignout,
    ethBalance
  } = useContext(AppData);


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
        {/* Select network */}
        {/* <div className="setting-option header-btn">
          <select id="current-wallet-network" onChange={(event) => _setCurrentNetwork(event.target.value)} defaultValue={"0x5"} value={currentNetwork}>
            {Object.keys(NETWORKS).map(element =>
              <option value={NETWORKS[element]} key={element}>{element}</option>
            )}
          </select>
        </div> */}
        {!walletData.isConnected && (
          <div className="setting-option header-btn">
            <Button color="primary" className="connectBtn" onClick={() => setShowConnectWalletModel(true)} fullwidth={true}>
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
                    <span className="price">{ethBalance ? parseFloat(ethBalance)?.toFixed(4) : 0} {currenyOfCurrentNetwork(currentNetwork)}</span>
                  </div>
                  <div className="button" />
                </li>
              </ul>
            </div>
            <div className="add-fund-button mt--20 pb--20">
              <Button className="w-100" onClick={() => setShowChangeNetworkModel(true)}>
                Change network
              </Button>
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
            <button type="button" onClick={onSignout}>
              Sign Out
            </button>
          </li>
        </ul>
      </div>
      {/* <ConnectWallets show={showConnectWalletModel} handleModal={(prev) => setShowConnectWalletModel(!prev)} handleSubmit={handleConnectWalletSubmit} />
      <SwitchNetwork show={showChangeNetworkModel} handleModal={(prev) => setShowChangeNetworkModel(!prev)} handleSubmit={handleChangeNetworkSubmit} /> */}
    </div>
  );
};

export default UserDropdown;

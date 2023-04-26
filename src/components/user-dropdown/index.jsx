import Image from "next/image";
import Anchor from "@ui/anchor";
import { useContext, useState } from "react";
import { AppData } from "src/context/app-context";
import { ethers } from "ethers";
import Button from "@ui/button";
import { doLogOut } from "src/lib/user";
import { useRouter } from "next/router";

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
      setIsAuthenticatedCryptoWallet(walletData.isConnected);
      // }
    } catch (err) {
      console.log(err);
    }
  };
  const onDisconnect = async () => {
    setWalletData({
      provider: null,
      accounts: null,
      balance: null,
      ethers,
      isConnected: false
    });
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
            <Anchor path="/product">Set Display Name</Anchor>
          </span>
        </div>
        {!isAuthenticatedCryptoWallet && (
          <div className="setting-option header-btn">
            <Button color="primary" className="connectBtn" onClick={onConnect} fullwidth="true">
              Wallet Connect
            </Button>
          </div>
        )}
        {isAuthenticatedCryptoWallet && (
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
              <Anchor className="btn btn-primary-alta w-100" path="/connect">
                Add Your More Funds
              </Anchor>
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

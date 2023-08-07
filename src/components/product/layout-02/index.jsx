import { useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import Button from "@ui/button";
import { toast } from "react-toastify";
import { ImageType } from "@utils/types";
import { isImgLink } from "@utils/methods";
import ProductBid from "@components/product-bid";
import { AppData } from "src/context/app-context";
import { switchNetwork, getStakingReward, getStakingRewardTokenDecimal, convertWeitoEther, getStakingNFTContract, getStakedBalances } from "../../../lib/BlokchainHelperFunctions";
import strapi from "@utils/strapi";
import { BINANCE_NETWORK_CHAIN_ID, ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import { ProgressBar } from "react-bootstrap";


const CountdownTimer = dynamic(() => import("@ui/countdown/layout-01"), {
  ssr: false
});

const StakeProduct = ({
  id, title, slug, image, stakingAmount, collectionName, stakingIndex, restakingCount,
  stakingStartTime, stakingEndTime, network, collectionType,
  NFTContractAddress, nftID, refreshPageData, multiselection, isSelected, updateSelected }) => {
  const { walletData, setWalletData } = useContext(AppData);

  const [totalReward, setTotalReward] = useState(0);
  const [totalRewardLoading, setTotalRewardLoading] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [completedDays, setCompletedDays] = useState(0);

  function getTotalDays() {
    let startTime = new Date(stakingStartTime);
    let endTime = new Date(stakingEndTime);
    let total = (endTime.getTime() - startTime.getTime()) / 86400000;
    setTotalDays(parseInt(total));
    let completed = (new Date().getTime() - startTime.getTime()) / 86400000;
    setCompletedDays(parseInt(completed));
  }

  useEffect(() => {
    getTotalDays();
    getTotalStakingReward();
    const interval = setInterval(function () {
      // getTotalStakingReward();
      getTotalDays();
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
    }
  }, [walletData]);

  async function getTotalStakingReward() {
    setTotalRewardLoading(true);
    const oldBalance = await getStakedBalances(walletData, walletData.account, NFTContractAddress, nftID, stakingIndex);
    console.log(oldBalance);
    const rewardAmount = oldBalance + await getStakingReward(walletData, walletData.account, NFTContractAddress, nftID, stakingIndex);
    // console.log(rewardAmount);
    const decimals = await getStakingRewardTokenDecimal(walletData);
    //convert price
    // console.log(decimals);
    let convertedPrice;
    if (decimals == 18) {
      convertedPrice = convertWeitoEther(walletData.ethers, rewardAmount);
    } else {
      convertedPrice = (rewardRate * (10 ** decimals));
    }
    // console.log(convertedPrice);
    setTotalReward(convertedPrice);
    setTotalRewardLoading(false);
  }

  async function claimReward() {
    setTotalRewardLoading(true);
    try {
      // chnage network
      if (network === "Ethereum") {
        if (!await switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
          // ethereum testnet
          setTotalRewardLoading(false);
          return;
        }
      } else if (network === "Polygon") {
        if (!await switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
          // polygon testnet
          setTotalRewardLoading(false);
          return;
        }
      } else if (network === "Binance") {
        if (!await switchNetwork(BINANCE_NETWORK_CHAIN_ID)) {
          // polygon testnet
          setTotalRewardLoading(false);
          return;
        }
      }

      const stakingNFT = await getStakingNFTContract(walletData);
      if (collectionType === "Single") {
        const transaction = await stakingNFT.unStakeToken(NFTContractAddress, nftID, 1, stakingIndex, 1);
        const receipt = await transaction.wait();
        console.log(receipt);
      } else if (collectionType === "Multiple") {
        const transaction = await stakingNFT.unStakeToken(NFTContractAddress, nftID, stakingAmount, stakingIndex, 0);
        const receipt = await transaction.wait();
        console.log(receipt);
      }

      // update auction to complete
      const res = await strapi.update("collectible-stakings", id, {
        rewardAmount: totalReward,
        isClaimed: true
      });

      await refreshPageData(1);
      toast.success("NFT unstake successfully!");
      setTotalRewardLoading(false);
    } catch (error) {
      console.log(error);
      setTotalRewardLoading(false);
    }
    setTotalRewardLoading(false);
  }

  async function restakeToken() {
    setTotalRewardLoading(true);
    try {
      // chnage network
      if (network === "Ethereum") {
        if (!await switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
          // ethereum testnet
          setTotalRewardLoading(false);
          return;
        }
      } else if (network === "Polygon") {
        if (!await switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
          // polygon testnet
          setTotalRewardLoading(false);
          return;
        }
      } else if (network === "Binance") {
        if (!await switchNetwork(BINANCE_NETWORK_CHAIN_ID)) {
          // polygon testnet
          setTotalRewardLoading(false);
          return;
        }
      }

      const stakingNFT = await getStakingNFTContract(walletData);
      const stakeDuration = await stakingNFT.rewardRateDuration();
      if (collectionType === "Single") {
        const transaction = await stakingNFT.reStakeToken(NFTContractAddress, nftID, 1, stakingIndex);
        const receipt = await transaction.wait();
        console.log(receipt);
      } else if (collectionType === "Multiple") {
        const transaction = await stakingNFT.reStakeToken(NFTContractAddress, nftID, 0, stakingIndex);
        const receipt = await transaction.wait();
      }

      // update auction to restaking duration
      const res = await strapi.update("collectible-stakings", id, {
        stakingStartTime: new Date(),
        stakingEndTime: new Date(new Date().getTime() + 1000 * stakeDuration),
        restakingCount: restakingCount + 1
      });

      await refreshPageData();
      toast.success("NFT restake successfully!");
      setTotalRewardLoading(false);
    } catch (error) {
      console.log(error);
      setTotalRewardLoading(false);
    }
    setTotalRewardLoading(false);
  }

  return (
    <>

      <div className={clsx("product-style-one")}>
        <div className="card-thumbnail">
          {image && (
            <Anchor path={`#`} className={"nav-stake-selection"}>
              {isImgLink(image?.src ? image.src : image) ?
                <>
                  <Image
                    src={image?.src ? image.src : image}
                    alt={image?.alt || "NFT_portfolio"}
                    width={533}
                    height={533}
                  />
                  {multiselection &&

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => updateSelected()}
                      className="stackselection"
                    />


                  }
                </>
                :
                <video width={"100%"} height={"auto"}>
                  <source src={image?.src ? image.src : image} />
                </video>
              }
            </Anchor>
          )}
          {stakingEndTime && <CountdownTimer date={new Date(stakingEndTime)} />}
        </div>
        <div className="read-content">
          <div className="product-share-wrapper">
            <div className="profile-share">
            </div>
            <div className="last-bid">
            </div>
          </div>
          <Anchor path={`#`}>
            <h6 className="title">{title}</h6>
          </Anchor>
          <span className="latest-bid">From {collectionName}</span><br />
          <span className="latest-bid">Total NFT Stake: {stakingAmount}</span><br />
          <span className="latest-bid">Days completed: {completedDays}/{totalDays}</span>
          {/* <div className="row"> */}
          <ProgressBar variant="success" now={(completedDays * 100) / totalDays} />
          {/* </div> */}
          <div className="row">
            <Button className="mt-3 w-100" onClick={() => claimReward()} size="small" disabled={totalRewardLoading}>
              {new Date() > new Date(stakingEndTime) ?
                "Unstake & Claim Reward" : "Unstake Collectible"
              }
            </Button>
            {new Date() > new Date(stakingEndTime) &&
              <Button className="mt-3 w-100" onClick={() => restakeToken()} size="small" disabled={totalRewardLoading}>
                Restake NFT
              </Button>
            }
          </div>
        </div>
        <ProductBid network={network} />
      </div>
    </>
  );
};

StakeProduct.propTypes = {
  title: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  stakingAmount: PropTypes.number,
  image: PropTypes.oneOfType([PropTypes.shape(), PropTypes.string]),
  collectionName: PropTypes.string,
  stakingIndex: PropTypes.string,
  network: PropTypes.string,
  stakingStartTime: PropTypes.string,
  stakingEndTime: PropTypes.string,
};


StakeProduct.defaultProps = {
  likeCount: 0
};

export default StakeProduct;

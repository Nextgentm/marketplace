import PropTypes from "prop-types";
import clsx from "clsx";

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Button, ProgressBar } from "react-bootstrap";
import { useRouter } from "next/router";
import { AppData } from "src/context/app-context";
import { switchNetwork, getStakingReward, getStakingRewardTokenDecimal, convertWeitoEther, getStakingNFTContract, getStakedBalances } from "../../../lib/BlokchainHelperFunctions";
import strapi from "@utils/strapi";
import { BINANCE_NETWORK_CHAIN_ID, ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";

const TopSeller = ({ id, walletAddress, stakingAmount, stakingStartTime, stakingEndTime, isClaimed, index, restakingCount, rewardType, NFTContractAddress, tokenId, product, refreshPageData }) => {
  const { walletData, setWalletData } = useContext(AppData);

  const [totalReward, setTotalReward] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [completedDays, setCompletedDays] = useState(0);

  async function getTotalDays() {
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
    const oldBalance = await getStakedBalances(walletData, walletData.account, NFTContractAddress, product.nftID, index);
    // console.log(oldBalance);
    const rewardAmount = oldBalance + await getStakingReward(walletData, walletData.account, NFTContractAddress, product.nftID, index);
    // console.log(rewardAmount);
    const decimals = await getStakingRewardTokenDecimal(walletData);
    //convert price
    // console.log(decimals);
    let convertedPrice;
    if (decimals == 18) {
      convertedPrice = convertWeitoEther(walletData.ethers, rewardAmount);
    } else {
      convertedPrice = (eth * (10 ** decimals));
    }
    // console.log(convertedPrice);
    setTotalReward(convertedPrice);
  }

  async function claimReward() {
    try {
      // chnage network
      if (product.collection.data.networkType === "Ethereum") {
        if (!await switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
          // ethereum testnet
          return;
        }
      } else if (product.collection.data.networkType === "Polygon") {
        if (!await switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
          // polygon testnet
          return;
        }
      } else if (product.collection.data.networkType === "Binance") {
        if (!await switchNetwork(BINANCE_NETWORK_CHAIN_ID)) {
          // polygon testnet
          return;
        }
      }

      const stakingNFT = await getStakingNFTContract(walletData);
      if (product.collection.data.collectionType === "Single") {
        const contractAddress = product.collection.data.contractAddress;

        const transaction = await stakingNFT.unStakeToken(contractAddress, product.nftID, 1, index, 1);
        const receipt = await transaction.wait();
        console.log(receipt);
      } else if (product.collection.data.collectionType === "Multiple") {
        const contractAddress = product.collection.data.contractAddress1155;

        const transaction = await stakingNFT.unStakeToken(contractAddress, product.nftID, stakingAmount, index, 0);
        const receipt = await transaction.wait();
      }

      // update auction to complete
      const res = await strapi.update("collectible-stakings", id, {
        rewardAmount: totalReward,
        isClaimed: true
      });

      await refreshPageData();
      toast.success("NFT unstake successfully!");
    } catch (error) {
      console.log(error);
    }
  }

  async function restakeToken() {
    try {
      // chnage network
      if (product.collection.data.networkType === "Ethereum") {
        if (!await switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
          // ethereum testnet
          return;
        }
      } else if (product.collection.data.networkType === "Polygon") {
        if (!await switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
          // polygon testnet
          return;
        }
      } else if (product.collection.data.networkType === "Binance") {
        if (!await switchNetwork(BINANCE_NETWORK_CHAIN_ID)) {
          // polygon testnet
          return;
        }
      }

      const stakingNFT = await getStakingNFTContract(walletData);
      const stakeDuration = await stakingNFT.rewardRateDuration();
      if (product.collection.data.collectionType === "Single") {
        const contractAddress = product.collection.data.contractAddress;

        const transaction = await stakingNFT.reStakeToken(contractAddress, product.nftID, 1, index);
        const receipt = await transaction.wait();
        console.log(receipt);
      } else if (product.collection.data.collectionType === "Multiple") {
        const contractAddress = product.collection.data.contractAddress1155;

        const transaction = await stakingNFT.reStakeToken(contractAddress, product.nftID, 0, index);
        const receipt = await transaction.wait();
      }

      // update auction to restaking duration
      const res = await strapi.update("collectible-stakings", id, {
        stakingStartTime: new Date(),
        stakingEndTime: new Date(new Date().getTime() + (1000 * stakeDuration)),
        restakingCount: restakingCount + 1
      });

      await refreshPageData();
      toast.success("NFT restake successfully!");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="top-seller-inner-one pt-2">
      <div className="row">
        <div className="col">
          <span>
            {stakingAmount && (
              <>
                {stakingAmount && <span className="count-number">{`Total NFT stake : ${stakingAmount} NFT`}</span>}
              </>
            )}
          </span>
        </div>
        <div className="col" style={{ textAlign: "right" }}>
          <span className="latest-bid">Days completed: {completedDays}/{totalDays}</span>
        </div>
      </div>
      <div className="mt-2">
        <ProgressBar variant="success" now={(completedDays * 100) / totalDays} />
      </div>
      <div className="row">
        {isClaimed === false && rewardType == "Crypto" && (
          <>
            <div className="col">
              <Button className="mt-3 w-100" size="lg" onClick={() => claimReward()}>
                {new Date() > new Date(stakingEndTime) ?
                  "Unstake & Claim Reward" : "Unstake Collectible"
                }
              </Button>
            </div>
            <div className="col">
              {new Date() > new Date(stakingEndTime) &&
                <Button className="mt-3 w-100" size="lg" onClick={() => restakeToken()}>
                  Restake NFT
                </Button>
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
};

TopSeller.propTypes = {
  walletAddress: PropTypes.string.isRequired,
  stakingStartTime: PropTypes.string,
  NFTContractAddress: PropTypes.string.isRequired,
  rewardType: PropTypes.string.isRequired,
  tokenId: PropTypes.string.isRequired,
  isClaimed: PropTypes.bool
};

export default TopSeller;

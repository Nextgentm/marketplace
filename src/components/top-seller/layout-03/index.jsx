import PropTypes from "prop-types";
import clsx from "clsx";

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { AppData } from "src/context/app-context";
import { switchNetwork, getStakingReward, getStakingRewardTokenDecimal, convertWeitoEther, getStakingNFTContract } from "../../../lib/BlokchainHelperFunctions";
import strapi from "@utils/strapi";
import { BINANCE_NETWORK_CHAIN_ID, ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";

const TopSeller = ({ id, walletAddress, stakingAmount, stakingStartTime, isClaimed, index, rewardType, NFTContractAddress, tokenId, product, refreshPageData }) => {
  const { walletData, setWalletData } = useContext(AppData);

  const [totalReward, setTotalReward] = useState(0);

  useEffect(() => {
    setInterval(function () {
      getTotalStakingReward();
    }, 60 * 1000);
  }, [walletData]);

  async function getTotalStakingReward() {
    const rewardAmount = await getStakingReward(walletData, walletAddress, NFTContractAddress, tokenId, index);
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

        const transaction = await stakingNFT.unStakERC721Token(contractAddress, product.nftID, index);
        const receipt = await transaction.wait();
        console.log(receipt);
      } else if (product.collection.data.collectionType === "Multiple") {
        const contractAddress = product.collection.data.contractAddress1155;

        const transaction = await stakingNFT.unStakERC1155Token(contractAddress, product.nftID, stakingAmount, index);
        const receipt = await transaction.wait();
      }

      // update auction to complete
      const res = await strapi.update("collectible-stakings", id, {
        stakingEndTime: new Date(),
        rewardAmount: parseInt(totalReward),
        isClaimed: true
      });

      await refreshPageData();
      toast.success("NFT unstake successfully!");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="top-seller-inner-one pt-2">
      <div className="top-seller-wrapper">
        <div className="top-seller-content col-lg-8 col-md-7 col-sm-12 mt_md--50 mt_sm--60">
          <span>
            {stakingAmount && (
              <>
                {" Total staking reawrd till now : "}{totalReward}
                {/* {product.auction.data.priceCurrency} by {name} */}
                <br />
                {stakingAmount && <span className="count-number">{`Total NFT stake : ${stakingAmount} NFT`}</span>}
              </>
            )}
            {/* <Anchor path={path}>{name}</Anchor> */}
          </span>
          {/* {time && <span className="count-number">{new Date(time).toLocaleString()}</span>} */}
        </div>
        <div className="ms-4 accept-bid-button-div col-lg-4 col-md-5 col-sm-12 mt_md--50 mt_sm--60">
          {isClaimed === false && rewardType == "Crypto" && (
            <Button size="lg" onClick={() => claimReward()}>
              {" Claim Staking reward "}
            </Button>
          )}
        </div>
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

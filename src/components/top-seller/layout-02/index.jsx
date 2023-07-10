import Image from "next/image";
import PropTypes from "prop-types";
import clsx from "clsx";
import Anchor from "@ui/anchor";

import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { AppData } from "src/context/app-context";
import { convertEthertoWei, getTradeContract, getTokenContract, switchNetwork, getDateForSolidity } from "../../../lib/BlokchainHelperFunctions";
import { useMutation } from "@apollo/client";
import { UPDATE_COLLECTIBLE } from "src/graphql/mutation/collectible/updateCollectible";
import { UPDATE_BIDDING } from "src/graphql/mutation/bidding.js/updateBidding";
import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";
import strapi from "@utils/strapi";
import { BINANCE_NETWORK_CHAIN_ID, ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";

const TopSeller = ({ name, time, path, image, eth, isVarified, product, auction, id, refreshPageData, buyerOrderSignature }) => {
  const { walletData, setWalletData } = useContext(AppData);

  const router = useRouter();
  const [updateCollectible, { data: updatedCollectible }] = useMutation(UPDATE_COLLECTIBLE);
  const [updateBidding, { data: updatedBidding }] = useMutation(UPDATE_BIDDING);
  const [createOwnerHistory, { data: createdOwnerHistory }] = useMutation(CREATE_OWNER_HISTORY);

  useEffect(() => {
  }, [updatedCollectible]);

  async function completeAuction(quantity, newOwner) {
    updateCollectible({
      variables: {
        "data": {
          putOnSale: false,
          owner: newOwner
        },
        "updateCollectibleId": product.id
      }
    });
    updateBidding({
      variables: {
        "data": {
          isAccepted: true
        },
        "updateBiddingId": id
      }
    });
    //update auction
    const res = await strapi.update("auctions", auction.data.id, {
      status: quantity == 0 ? "Completed" : "Live",
      remainingQuantity: quantity
    });
  }

  async function acceptBid() {
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
      const signer = walletData.provider.getSigner();
      const seller = auction.data.walletAddress;
      const buyer = name;
      let erc20Address;
      //Select token contract address according to current network
      if (walletData.network == "Polygon") {
        erc20Address = auction.data.paymentToken?.data?.polygonAddress;
      } else if (walletData.network == "Ethereum") {
        erc20Address = auction.data.paymentToken?.data?.ethAddress;
      } else if (walletData.network == "Binance") {
        erc20Address = auction.data.paymentToken?.data?.binanceAddress;
      }
      if (!erc20Address) {
        toast.error("Token address not found for current network!");
        return;
      }
      const tokenContract = await getTokenContract(walletData, erc20Address);
      const decimals = await tokenContract.decimals();
      //convert price
      let convertedPrice;
      if (decimals == 18) {
        convertedPrice = convertEthertoWei(walletData.ethers, eth);
      } else {
        convertedPrice = (eth * (10 ** decimals));
      }
      const nftAddress =
        product.collection.data.collectionType === "Single"
          ? product.collection.data.contractAddress
          : product.collection.data.contractAddress1155;
      const nftType = product.collection.data.collectionType === "Single" ? 1 : 0;
      const skipRoyalty = false;
      const unitPrice = `${convertedPrice}`;
      const amount = `${parseFloat(auction.data.quantity) * parseFloat(unitPrice)}`;
      const tokenId = `${product.nftID}`;
      const nftOrderQuantity = auction.data.quantity;
      const startTimestamp = getDateForSolidity(auction.data.startTimestamp);
      const endTimeStamp = getDateForSolidity(auction.data.endTimeStamp);
      const sellerOrderSignature = auction.data.signature;
      const qty = `${auction.data.quantity ? auction.data.quantity : 1}`;

      // Pull the deployed contract instance
      const tradeContract = await getTradeContract(walletData);
      const userBalance = await tokenContract.balanceOf(buyer);
      if (amount > parseInt(userBalance._hex)) {
        toast.error("Bidder not have enough balance");
        return;
      }
      try {
        console.log([
          seller,
          buyer,
          erc20Address,
          nftAddress,
          nftType,
          unitPrice,
          nftOrderQuantity,
          skipRoyalty,
          startTimestamp,
          endTimeStamp,
          tokenId,
          amount,
          qty,
          sellerOrderSignature,
          buyerOrderSignature
        ]);
        const transaction = await tradeContract.executeBid([
          seller,
          buyer,
          erc20Address,
          nftAddress,
          nftType,
          unitPrice,
          nftOrderQuantity,
          skipRoyalty,
          startTimestamp,
          endTimeStamp,
          tokenId,
          amount,
          qty,
          sellerOrderSignature,
          buyerOrderSignature
        ]);
        const receipt = await transaction.wait();
        const transactionHash = receipt.transactionHash;
        if (receipt) {
          await completeAuction(auction.data.remainingQuantity - qty, buyer);
          await createOwnerHistory({
            variables: {
              data: {
                auction: auction.data.id,
                collectible: product.id,
                event: "TimeAuction",
                fromWalletAddress: seller,
                quantity: qty,
                toWalletAddress: buyer,
                transactionHash: transactionHash
              }
            }
          });
        }
        await refreshPageData();
        if (auction.data.sellType === "FixedPrice") {
          toast.success("NFT purchased successfully!");
        } else {
          toast.success("Bidding Accepted successfully!");
        }
        // router.reload();
      } catch (error) {
        toast.error(error.reason);
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="top-seller-inner-one">
      <div className="top-seller-wrapper">
        {image?.src && (
          <div className={clsx("thumbnail", isVarified && "varified")}>
            <Anchor path={path}>
              <Image
                src={image?.src}
                alt={image?.alt || "Nft_Profile"}
                width={image?.width || 50}
                height={image?.height || 50}
              />
            </Anchor>
          </div>
        )}
        <div className="top-seller-content col-lg-9 col-md-7 col-sm-12 mt_md--50 mt_sm--60">
          <span>
            {eth && (
              <>
                {eth}{" "}{auction.data?.priceCurrency} By
                {/* {product.auction.data.priceCurrency} by {name} */}
                {name && <span className="count-number">{walletData.account == name ? "You" : name.substr(0, 5) + "..." + name.substr(-5)}</span>}
              </>
            )}
            {/* <Anchor path={path}>{name}</Anchor> */}
          </span>
          {time && <span className="count-number">{new Date(time).toLocaleString()}</span>}
        </div>
        <div className="ms-4 accept-bid-button-div col-lg-3 col-md-5 col-sm-12 mt_md--50 mt_sm--60">
          {product.owner === walletData.account && auction.data.status == "Live" && (
            <Button size="lg" onClick={() => acceptBid()}>
              {" "}
              Accept Bid{" "}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

TopSeller.propTypes = {
  name: PropTypes.string.isRequired,
  time: PropTypes.string,
  path: PropTypes.string.isRequired,
  eth: PropTypes.string,
  image: PropTypes.shape({
    src: PropTypes.oneOfType([PropTypes.shape(), PropTypes.string]).isRequired,
    alt: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
  }).isRequired,
  isVarified: PropTypes.bool
};

export default TopSeller;

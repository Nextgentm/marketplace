import { useState, useContext, useEffect } from "react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import Image from "next/image";
import Anchor from "@ui/anchor";
import Button from "@ui/button";
import PlaceBidModal from "@components/modals/placebid-modal";
import { ImageType } from "@utils/types";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { AppData } from "src/context/app-context";
import { BINANCE_NETWORK_CHAIN_ID, ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";

import { convertEthertoWei, convertWeitoEther, getTokenContract, getTradeContract, switchNetwork } from "../../lib/BlokchainHelperFunctions";
import { UPDATE_COLLECTIBLE } from "src/graphql/mutation/collectible/updateCollectible";
import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";
import { useMutation } from "@apollo/client";
import strapi from "@utils/strapi";

const Countdown = dynamic(() => import("@ui/countdown/layout-02"), {
  ssr: false
});

const PlaceBet = ({ highest_bid, auction_date, product, auction, refreshPageData, isOwner, btnColor, className }) => {
  const { walletData, setWalletData, userData } = useContext(AppData);
  const [showBidModal, setShowBidModal] = useState(false);
  const handleBidModal = () => {
    if (!userData) {
      toast.error("Please login first");
      return;
    }
    if (!walletData.isConnected) {
      toast.error("Please connect wallet first");
      return;
    }
    setShowBidModal((prev) => !prev);
  };

  const router = useRouter();

  const [updateCollectible, { data: updatedCollectible }] = useMutation(UPDATE_COLLECTIBLE);
  const [createOwnerHistory, { data: createdOwnerHistory }] = useMutation(CREATE_OWNER_HISTORY);

  useEffect(() => {
  }, [updatedCollectible]);

  async function completeAuction(quantity) {
    updateCollectible({
      variables: {
        "data": {
          putOnSale: !(quantity == 0),
          owner: walletData.account
        },
        "updateCollectibleId": product.id
      }
    });

    const res = await strapi.update("auctions", auction.data.id, {
      status: quantity == 0 ? "Completed" : "Live",
      remainingQuantity: quantity
    });
  }

  async function StoreData(price, quantity) {
    try {
      const signer = walletData.provider.getSigner();
      let contractAddress;
      if (product.collection.data.collectionType === "Single") {
        contractAddress = product.collection.data.contractAddress;
      } else if (product.collection.data.collectionType === "Multiple") {
        contractAddress = product.collection.data.contractAddress1155;
      }
      // Pull the deployed contract instance
      let TokenContractAddress;
      //Select token contract address according to current network
      if (walletData.network == "Polygon") {
        TokenContractAddress = auction.data.paymentToken?.data?.polygonAddress;
      } else if (walletData.network == "Ethereum") {
        TokenContractAddress = auction.data.paymentToken?.data?.ethAddress;
      } else if (walletData.network == "Binance") {
        TokenContractAddress = auction.data.paymentToken?.data?.binanceAddress;
      }
      if (!TokenContractAddress) {
        toast.error("Token address not found for current network!");
        return;
      }
      const tokenContract = await getTokenContract(walletData, TokenContractAddress);
      // const allowance = await tokenContract.allowance(walletData.account, walletData.contractData.TransferProxy.address);
      // const allowanceAmount = parseInt(allowance._hex, 16);
      const decimals = await tokenContract.decimals();
      //convert price
      let convertedPrice;
      if (decimals == 18) {
        convertedPrice = convertEthertoWei(walletData.ethers, price);
      } else {
        convertedPrice = (price * (10 ** decimals));
      }
      const requireAllowanceAmount = "" + parseInt(convertedPrice * quantity);
      // console.log(price, decimals, convertedPrice, quantity, requireAllowanceAmount);
      const userBalance = await tokenContract.balanceOf(walletData.account);
      if (parseInt(requireAllowanceAmount) > parseInt(userBalance._hex, 16)) {
        toast.error("Amount is greater than your current balance");
        return;
      }
      const transaction = await tokenContract.increaseAllowance(walletData.contractData.TransferProxy.address, requireAllowanceAmount);
      const receipt = await transaction.wait();

      let isAccepted = false;
      if (auction.data.sellType == "FixedPrice") {
        const seller = auction.data.walletAddress;
        const buyer = walletData.account;
        const erc20Address = TokenContractAddress;
        const nftAddress = contractAddress;
        const nftType = product.collection.data.collectionType === "Single" ? 1 : 0;
        const skipRoyalty = false;
        const unitPrice = `${convertedPrice}`;
        const amount = `${parseFloat(quantity) * parseFloat(unitPrice)}`;
        const tokenId = `${product.nftID}`;
        const tokenURI = "-";
        const supply = `${product.supply ? product.supply : 1}`;
        const royaltyFee = `${product?.royalty ? product?.royalty : 0}`;
        const qty = `${quantity ? quantity : 1}`;

        // Pull the deployed contract instance
        const tradeContract = await getTradeContract(walletData);


        const transaction = await tradeContract.buyAsset([
          seller,
          buyer,
          erc20Address,
          nftAddress,
          nftType,
          unitPrice,
          skipRoyalty,
          amount,
          tokenId,
          tokenURI,
          supply,
          royaltyFee,
          qty
        ]);
        const receipt = await transaction.wait();

        const transactionHash = receipt.transactionHash;
        if (receipt) {
          isAccepted = true;
          await completeAuction(auction.data.remainingQuantity - qty);
          await createOwnerHistory({
            variables: {
              data: {
                auction: auction.data.id,
                collectible: product.id,
                event: "FixedPrice",
                fromWalletAddress: seller,
                quantity: qty,
                toWalletAddress: buyer,
                transactionHash: transactionHash
              }
            }
          });
        }
      }

      // create bidding
      const res = await strapi.create("biddings", {
        bidPrice: price,
        bidderAddress: walletData.account,
        timeStamp: new Date(),
        auction: auction.data.id,
        isAccepted
      });
      console.log(res);
      await refreshPageData();
      setShowBidModal(false);
      if (auction.data.sellType === "FixedPrice") {
        toast.success("NFT purchased successfully!");
      } else {
        toast.success("Bidding placed successfully!");
      }
      // router.reload();
    } catch (error) {

    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userData) {
      toast.error("Please login first");
      return;
    }
    if (!walletData.isConnected) {
      toast.error("Please connect wallet first");
      return;
    } // chnage network
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
    if (auction.data.sellType == "Bidding") {
      const price = event.target.price?.value;
      const quantity = auction.data.quantity;

      StoreData(price, quantity);
    } else {
      const price = auction.data.bidPrice;
      const quantity = event.target.quantity?.value ? event.target.quantity?.value : auction.data.quantity;

      StoreData(price, quantity);
    }
  };

  return (
    <>
      <div className={clsx("place-bet-area", className)}>
        <div className="rn-bet-create">
          <div className="bid-list winning-bid">
            <h6 className="title">{auction.data.sellType == "Bidding" ? "Auction Details" : "Buy Now"}</h6>
            <div className="top-seller-inner-one">
              <div className="top-seller-wrapper">
                {highest_bid?.bidder?.image?.src && (
                  <div className="thumbnail">
                    <Anchor path={highest_bid?.bidder?.slug}>
                      <Image src={highest_bid?.bidder?.image?.src} alt="Nft_Profile" width={44} height={44} />
                    </Anchor>
                  </div>
                )}

                {auction.data.sellType == "Bidding" ?
                  <div className="top-seller-content">
                    <span className="count-number">
                      {highest_bid?.amount ? "Bid Amount : " + highest_bid?.amount : ""}
                      {" " + highest_bid?.priceCurrency}
                    </span>
                    {highest_bid?.quantity > 1 &&
                      <span className="count-number">
                        {highest_bid?.remainingQuantity ? "Remaining Quantity : " + highest_bid?.remainingQuantity : ""}
                      </span>
                    }
                  </div> :
                  <div className="top-seller-content">
                    <span className="count-number">
                      {highest_bid?.amount ? "Price : " + highest_bid?.amount : ""}
                      {" " + highest_bid?.priceCurrency}
                    </span>
                    {highest_bid?.quantity > 1 &&
                      <span className="count-number">
                        {highest_bid?.remainingQuantity ? "Remaining Quantity : " + highest_bid?.remainingQuantity : ""}
                      </span>
                    }
                  </div>}
              </div>
            </div>
          </div>
          {auction_date && (
            <div className="bid-list left-bid">
              <h6 className="title">{new Date() < new Date(auction_date) ?
                (auction.data.sellType == "Bidding" ? "Auction will ended in" : "Sale will ended in")
                :
                (auction.data.sellType == "Bidding" ? "Auction has ended" : "Sale has ended")
              }</h6>
              <Countdown className="mt--15" date={auction_date} />
            </div>
          )}
        </div>
        <span>{isOwner && "You are the owner of this auction"}</span>
        <Button
          color={btnColor || "primary-alta"}
          className="mt--30"
          onClick={
            auction.data.sellType == "Bidding"
              ? handleBidModal
              : auction.data.quantity > 1
                ? handleBidModal
                : handleSubmit
          }
          disabled={isOwner || (auction_date && new Date() > new Date(auction_date))}
        >
          {auction.data.sellType == "Bidding" ? "Place a Bid" : "Buy Now"}
        </Button>
      </div>
      <PlaceBidModal show={showBidModal} handleModal={handleBidModal} bidPrice={auction.data.bidPrice} supply={product.supply} maxQuantity={auction.data.remainingQuantity} handleSubmit={handleSubmit} auction={auction}
        currency={highest_bid?.priceCurrency} />
    </>
  );
};

PlaceBet.propTypes = {
  highest_bid: PropTypes.shape({
    amount: PropTypes.number,
    bidder: PropTypes.shape({
      name: PropTypes.string,
      image: ImageType,
      slug: PropTypes.string
    })
  }),
  auction_date: PropTypes.string,
  btnColor: PropTypes.string,
  className: PropTypes.string
};

export default PlaceBet;

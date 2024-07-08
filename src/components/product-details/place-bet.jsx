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

import { convertEthertoWei, convertWeitoEther, getDateForSolidity, getTokenContract, getTradeContract, signMessage, switchNetwork } from "../../lib/BlokchainHelperFunctions";
import { UPDATE_COLLECTIBLE } from "src/graphql/mutation/collectible/updateCollectible";
import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";
import { useMutation } from "@apollo/client";
import strapi from "@utils/strapi";

const Countdown = dynamic(() => import("@ui/countdown/layout-02"), {
  ssr: false
});

const PlaceBet = ({ highest_bid, auction_date, product, auction, refreshPageData, isOwner, btnColor, className, primarySale }) => {
  const { walletData, setWalletData, userData } = useContext(AppData);
  const [isMoonPayDownTimeData, setMoonPayDownTimeData] = useState([]);
  const [isMoonPayDownTime, setMoonPayDownTime] = useState({ result: false, endTime: null });
  const [isMoonPayMethod, setMoonPayMethod] = useState(false);
  const handleBidModalForMoonpay = () => {
    if (!userData) {
      toast.error("Please login first");
      return;
    }
    setMoonPayMethod((prev) => !prev);
    setShowBidModal((prev) => !prev);
  };
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

  const checkGasFee = async () => {
    const res = await axios({
      method: "get",
      url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/calulate-gas-fees?auctionId=${auction.data.id}`
    });
    console.log(res);
  }

  //moonpay integration
  const payUsingMoonpay = async (quantity) => {
    // show the moonpay integration part
    try {

      if (userData) {
        checkGasFee();
        const moonpaySdk = window.MoonPayWebSdk.init({
          flow: "nft",
          environment: process.env.NEXT_PUBLIC_SENTRY_ENV == "production" ? "production" : "sandbox",
          variant: "overlay",
          params: {
            apiKey: `${process.env.NEXT_PUBLIC_MOONPAY_API_KEY}`,
            contractAddress: product.collection.data.collectionType == "Single" ? product.collection.data.contractAddress : product.collection.data.contractAddress1155,
            tokenId: product.nftID,
            listingId: auction.data.id.toString(),
            redirectURL: window.location.href,
            quantity: quantity ? quantity : 1
          }
        });
        const urlForSignature = moonpaySdk.generateUrlForSigning();
        // console.log(urlForSignature);
        // sign it with API secret and return the signature.
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/sign_url`, {
          method: "POST",
          body: urlForSignature,
        });
        const signature = await response.text();
        // console.log(signature);
        // Once you have the signature, you can update the SDK with it
        moonpaySdk.updateSignature(decodeURIComponent(signature));
        moonpaySdk.show();
      } else {
        toast.error("Please login first");
        return;
      }
    } catch (error) {
      console.log("Error: " + error);
      toast.error("Error while moonpay integration");
    }
  }

  const downtimeCheck = async () => {
    const response = await strapi.find("payment-downtimes", {
      filters: {
        paymentType: "moonpay",
      },
      sort: "startTime:desc"
    });
    setMoonPayDownTimeData(response.data);
    // console.log(response.data);
    // on first time load set the value
    const currentDate = new Date();
    response.data.map(item => {
      const startTime = new Date(item.startTime);
      const endTime = new Date(item.endTime);
      if (currentDate > startTime && currentDate < endTime) {
        // console.log({ result: true, endTime: endTime });
        setMoonPayDownTime({ result: true, endTime: endTime });
        return;
      }
    });
  }

  useEffect(() => {
    // check and update current downtime every minute
    const intervalId = setInterval(() => {
      const currentDate = new Date();
      let found = false;
      isMoonPayDownTimeData.map(item => {
        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime);
        if (currentDate > startTime && currentDate < endTime) {
          // console.log({ result: true, endTime: endTime });
          setMoonPayDownTime({ result: true, endTime: endTime });
          found = true;
          return;
        }
      });
      if (!found) {
        setMoonPayDownTime({ result: false, endTime: null });
      };
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isMoonPayDownTimeData]);

  useEffect(() => {
    downtimeCheck();
  }, []);

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

  async function getOrderBidHash(order) {
    try {
      const tradeContract = await getTradeContract(walletData);

      const orderSellerHash = await tradeContract.getOrderBuyerHash(order);
      console.log(orderSellerHash);
      return orderSellerHash;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function StoreData(price, quantity) {
    try {
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

      const seller = auction.data.walletAddress;
      const buyer = walletData.account;
      const erc20Address = TokenContractAddress;
      const nftAddress = contractAddress;
      const nftType = product.collection.data.collectionType === "Single" ? 1 : 0;
      const skipRoyalty = false;
      const unitPrice = `${convertedPrice}`;
      const amount = `${parseFloat(quantity) * parseFloat(unitPrice)}`;
      const tokenId = `${product.nftID}`;
      const nftOrderQuantity = auction.data.quantity;
      const startTimestamp = getDateForSolidity(auction.data.startTimestamp);
      const endTimeStamp = getDateForSolidity(auction.data.endTimeStamp);
      const sellerOrderSignature = auction.data.signature;
      const qty = `${quantity ? quantity : 1}`;

      const bidHash = await getOrderBidHash([
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
        "0x"
      ]);
      const buyerOrderSignature = await signMessage(walletData.provider, walletData.account, bidHash);
      console.log(buyerOrderSignature);
      if (!buyerOrderSignature) {
        return;
      }

      let isAccepted = false;
      if (auction.data.sellType == "FixedPrice") {

        // Pull the deployed contract instance
        const tradeContract = await getTradeContract(walletData);
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
        const transaction = await tradeContract.buyAsset([
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
        signature: buyerOrderSignature,
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
      if (error.message.includes("execution reverted:")) {
        // Extract the error message
        const startIndex = error.message.indexOf("execution reverted:");
        const endIndex = error.message.indexOf('",', startIndex);
        const extractedErrorMessage = (startIndex !== -1 && endIndex !== -1) ? error.message.substring(startIndex + 20, endIndex).trim() : null;
        if (extractedErrorMessage) {
          toast.error(`Transaction failed: ${extractedErrorMessage}`);
        } else {
          toast.error("Error while purchasing NFT!");
        }
      } else {
        toast.error("Error while purchasing NFT!");
        console.log(error);
      }
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

  const handleSubmitForMoonpay = async (event) => {
    event.preventDefault();
    if (!userData) {
      toast.error("Please login first");
      return;
    }
    const quantity = event.target.quantity?.value ? event.target.quantity?.value : auction.data.quantity;

    payUsingMoonpay(quantity);
  };

  const isDateLessThan30DaysAway = (auction_date) => {
    //calculate difference
    const timeDifference = new Date(auction_date) - new Date();
    // Calculate the number of days
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    // Check if the difference is more than 30 days
    return daysDifference <= 30;
  }

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
              {isDateLessThan30DaysAway(auction_date) &&
                <>
                  <h6 className="title">{new Date() < new Date(auction_date) ?
                    (auction.data.sellType == "Bidding" ? "Auction will ended in" : "Sale will ended in")
                    :
                    (auction.data.sellType == "Bidding" ? "Auction has ended" : "Sale has ended")
                  }</h6>
                  <Countdown className="mt--15" date={auction_date} />
                </>
              }
            </div>
          )}
        </div>
        <span>{isOwner && "You are the owner of this auction"}</span>

        {/* temporary disable moonpay */}
        {auction?.data?.status == "Live" && auction.data.sellType == "FixedPrice" && primarySale &&
          <Button
            color={btnColor || "primary-alta"}
            className="mt--30"
            onClick={() => auction.data.quantity > 1 ? handleBidModalForMoonpay() : payUsingMoonpay()}
            disabled={isOwner || (auction_date && new Date() > new Date(auction_date)) || isMoonPayDownTime.result}>
            {isMoonPayDownTime.result ? "MoonPay is down. Try after " + new Date(isMoonPayDownTime.endTime).toLocaleString() + "." : "Pay using MoonPay"}
          </Button>
        }

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
      {/* for moonpay */}
      <PlaceBidModal show={isMoonPayMethod} handleModal={handleBidModalForMoonpay} bidPrice={auction.data.bidPrice} supply={product.supply} maxQuantity={auction.data.remainingQuantity} handleSubmit={handleSubmitForMoonpay} auction={auction}
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

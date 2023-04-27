import { useState, useContext } from "react";
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
import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";

import { convertEthertoWei, convertWeitoEther } from "../../lib/BlokchainHelperFunctions";
import ERC721Contract from "../../contracts/json/erc721.json";
import ERC1155Contract from "../../contracts/json/erc1155.json";
import TradeContract from "../../contracts/json/trade.json";
import TransferProxy from "../../contracts/json/TransferProxy.json";
import TokenContract from "../../contracts/json/ERC20token.json";

const Countdown = dynamic(() => import("@ui/countdown/layout-02"), {
  ssr: false
});

const PlaceBet = ({ highest_bid, auction_date, product, isOwner, btnColor, className }) => {
  const { walletData, setWalletData } = useContext(AppData);
  const [showBidModal, setShowBidModal] = useState(false);
  const handleBidModal = () => {
    if (!walletData.isConnected) {
      toast.error("Please connect wallet first");
      return;
    }
    setShowBidModal((prev) => !prev);
  };

  const router = useRouter();

  async function switchNetwork(chainId) {
    if (parseInt(window.ethereum.networkVersion, 2) === parseInt(chainId, 2)) {
      console.log(`Network is already with chain id ${chainId}`);
      return true;
    }
    try {
      const res = await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }]
      });
      // console.log(res);
      return true;
    } catch (switchError) {
      // console.log(switchError);
      toast.error("Failed to change the network.");
    }
    return false;
  }

  async function completeAuction() {
    // update collectible putOnSale, saleType to true
    const response = await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/${product.id}`, {
      data: {
        putOnSale: false,
        owner: walletData.account
      }
    });
    console.log(response);
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
      //convert price
      const convertedPrice = convertEthertoWei(walletData.ethers, price);
      // Pull the deployed contract instance
      const tokenContract = new walletData.ethers.Contract(TokenContract.address, TokenContract.abi, signer);

      const allowance = await tokenContract.allowance(walletData.account, TransferProxy.address);
      const allowanceAmount = parseInt(allowance._hex, 16);
      const requireAllowanceAmount = "" + parseInt(convertedPrice * quantity);
            console.log(allowanceAmount, parseInt(requireAllowanceAmount));
            if (allowanceAmount < parseInt(requireAllowanceAmount)) {
        // approve nft first
        const transaction = await tokenContract.approve(TransferProxy.address, requireAllowanceAmount);
        const receipt = await transaction.wait();
        console.log(receipt);
      }
      let isAccepted = false;
      if (product.auction.data.sellType == "FixedPrice") {
        const seller = product.auction.data.walletAddress;
        const buyer = walletData.account;
        const erc20Address = TokenContract.address;
        const nftAddress = contractAddress;
        const nftType = product.collection.data.collectionType === "Single" ? 1 : 0;
        const skipRoyalty = true;
        const unitPrice = `${convertedPrice}`;
                const amount = `${parseFloat(product.auction.data.quantity) * parseFloat(unitPrice)}`;
        const tokenId = `${product.nftID}`;
        const tokenURI = "";
        const supply = `${product.supply ? product.supply : 1}`;
        const royaltyFee = `${product?.royalty ? product?.royalty : 10}`;
                const qty = `${quantity ? quantity: 1}`;

        // Pull the deployed contract instance
        const tradeContract = new walletData.ethers.Contract(TradeContract.address, TradeContract.abi, signer);

        console.log("Calling direct buy");
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
        console.log(receipt);
        if (receipt) {
          isAccepted = true;
          completeAuction();
        }
      }

      // create bidding
      const res = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/biddings`, {
        data: {
          bidPrice: price,
          bidderAddress: walletData.account,
          timeStamp: new Date(),
          auction: product.auction.data.id,
          isAccepted
        }
      });
      // console.log(res);
      if (product.auction.data.sellType === "FixedPrice") {
        toast.success("NFT purchased successfully!");
      } else {
        toast.success("Bidding placed successfully!");
      }
      router.reload();
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!walletData.isConnected) {
      toast.error("Please connect wallet first");
      return;
    } // chnage network
    if (product.collection.data.networkType === "Ethereum") {
      if (!switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
        // ethereum testnet
        return;
      }
    } else if (product.collection.data.networkType === "Polygon") {
      if (!switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
        // polygon testnet
        return;
      }
    }
    if (product.auction.data.sellType == "Bidding") {
      const price = event.target.price?.value;
            const quantity = product.auction.data.quantity;
      // console.log(price);
      StoreData(price, quantity);
    } else {
      const price = product.auction.data.bidPrice;
      const quantity = event.target.quantity?.value ? event.target.quantity?.value : product.auction.data.quantity;
      // console.log(price);
      StoreData(price,quantity);
    }
  };

  return (
    <>
      <div className={clsx("place-bet-area", className)}>
        <div className="rn-bet-create">
          <div className="bid-list winning-bid">
            <h6 className="title">{product.auction.data.sellType == "Bidding" ? "Auction Details" : "Buy Now"}</h6>
            {product.auction.data.sellType == "Bidding" && (
              <div className="top-seller-inner-one">
                <div className="top-seller-wrapper">
                  {highest_bid?.bidder?.image?.src && (
                    <div className="thumbnail">
                      <Anchor path={highest_bid?.bidder?.slug}>
                        <Image src={highest_bid?.bidder?.image?.src} alt="Nft_Profile" width={44} height={44} />
                      </Anchor>
                    </div>
                  )}

                  <div className="top-seller-content">
                    {/* <span className="heighest-bid">
                                            Bid Price
                                            Heighest bid <Anchor path={highest_bid?.bidder?.slug}>{highest_bid?.bidder?.name}</Anchor>
                                        </span> */}
                    <span className="count-number">
                      {highest_bid?.amount ? "Bid Amount :" + highest_bid?.amount : ""}
                      {highest_bid?.priceCurrency}
                    </span>
                    <span className="count-number">
                      {highest_bid?.quantity ? "Quantity :" + highest_bid?.quantity : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {auction_date && (
            <div className="bid-list left-bid">
              <h6 className="title">Auction has ended</h6>
              <Countdown className="mt--15" date={auction_date} />
            </div>
          )}
        </div>
        <span>{isOwner && "You are the owner of this auction"}</span>
        <Button
          color={btnColor || "primary-alta"}
          className="mt--30"
          onClick={product.auction.data.sellType == "Bidding" ? handleBidModal : product.auction.data.quantity > 1 ? handleBidModal : handleSubmit}
                    disabled={isOwner}
        >
          {product.auction.data.sellType == "Bidding" ? "Place a Bid" : "Buy Now"}
        </Button>
      </div>
      <PlaceBidModal show={showBidModal} handleModal={handleBidModal} product={product} handleSubmit={handleSubmit} />
    </>
  );
};

PlaceBet.propTypes = {
  highest_bid: PropTypes.shape({
    amount: PropTypes.string,
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

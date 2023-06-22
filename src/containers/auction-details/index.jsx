import PropTypes from "prop-types";
import clsx from "clsx";
import Sticky from "@ui/sticky";
import Button from "@ui/button";
import GalleryTab from "@components/product-details/gallery-tab";
import ProductTitle from "@components/product-details/title";
import ProductCategory from "@components/product-details/category";
import ProductCollection from "@components/product-details/collection";
import BidTab from "@components/product-details/bid-tab";
import PlaceBet from "@components/product-details/place-bet";
import { ImageType } from "@utils/types";
import { useEffect, useState, useContext } from "react";
import { TabContainer, TabContent, Nav, TabPane } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { AppData } from "src/context/app-context";
import { BINANCE_NETWORK_CHAIN_ID, ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import { getERC1155Balance, switchNetwork, validateInputAddresses } from "../../lib/BlokchainHelperFunctions";

import { useMutation } from "@apollo/client";
import { UPDATE_COLLECTIBLE } from "src/graphql/mutation/collectible/updateCollectible";
import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";
import strapi from "@utils/strapi";
import TimeAuctionModal from "@components/modals/time-auction";
import DirectSalesModal from "@components/modals/direct-sales";
import ConfirmModal from "@components/modals/confirm-modal";

// Demo Image

const AuctionDetailsArea = ({ space, className, auctionData }) => {

  const { walletData, setWalletData } = useContext(AppData);

  const [updateCollectible, { data: updatedCollectible }] = useMutation(UPDATE_COLLECTIBLE);
  const [createOwnerHistory, { data: createdOwnerHistory }] = useMutation(CREATE_OWNER_HISTORY);

  const router = useRouter();
  const [auction, setAuction] = useState(auctionData);
  const [erc1155MyBalance, setERC1155MyBalance] = useState(0);

  const [showDirectSalesModal, setShowDirectSalesModal] = useState(false);
  const handleDirectSaleModal = () => {
    setShowDirectSalesModal((prev) => !prev);
  };

  const [showTimeAuctionModal, setShowTimeAuctionModal] = useState(false);
  const handleTimeAuctionModal = () => {
    setShowTimeAuctionModal((prev) => !prev);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const handleConfirmModal = () => {
    setShowConfirmModal((prev) => !prev);
  };

  useEffect(() => {
    // if (updatedCollectible) {
    //   console.log(updatedCollectible);
    // }
    // console.log(updatedCollectible);
  }, [auction]);

  const refreshPageData = async () => {
    let _auctionData = await strapi.findOne("auctions", auction.data.id, {
      populate: ["collectible", "paymentToken", "biddings"],
    });
    // console.log(auction);

    let collectible = await strapi.findOne("collectibles", auction.data.collectible.data.id, {
      populate: ["owner_histories", "image", "collectibleProperties", "collection"],
    });
    _auctionData.data.collectible = collectible;
    setAuction(_auctionData);
    updateMyERC1155Balance();
  }

  const updateMyERC1155Balance = () => {
    if (walletData.isConnected) {
      if (walletData.account) {
        if (auction?.data?.collectible.data.collection.data.collectionType === "Multiple") {
          // check ERC1155 Token balance
          const contractAddress = auction?.data?.collectible.data?.collection?.data?.contractAddress1155;
          getERC1155Balance(walletData, walletData.account, contractAddress, auction?.data?.collectible.data.nftID).then((balance) => {
            setERC1155MyBalance(balance);
          }).catch((error) => { console.log("Error while factory call " + error) });
        }
      } else {
        setERC1155MyBalance(0);
      }
    } else {
      setERC1155MyBalance(0);
      // toast.error("Please connect wallet first");
    }
  }

  useEffect(() => {
    updateMyERC1155Balance();
  }, [walletData])

  // Auction Edit

  async function updateAuctionData(data) {
    try {
      // update auction to complete
      const res = await strapi.update("auctions", auction?.data?.id, {
        bidPrice: data.price,
        priceCurrency: data.currency,
        // sellType: data.sellType,
        status: "Live",
        startTimestamp: data.startTimestamp,
        endTimeStamp: data.endTimeStamp,
        paymentToken: data.paymentToken,
        quantity: data.quantity ? data.quantity : 1,
        remainingQuantity: data.quantity ? data.quantity : 1,
      });
      // console.log(res);
      toast.success("Auction updated successfully");
      setShowDirectSalesModal(false);
      setShowTimeAuctionModal(false);
      //update page data
      auction.data.bidPrice = data.price;
      auction.data.priceCurrency = data.currency;
      auction.data.status = "Live";
      auction.data.startTimestamp = data.startTimestamp;
      auction.data.endTimeStamp = data.endTimeStamp;
      auction.data.paymentToken = data.paymentToken;
      auction.data.quantity = data.quantity ? data.quantity : 1;
      auction.data.remainingQuantity = data.quantity ? data.quantity : 1;
    } catch (error) {
      toast.error("Error while creating auction");
      console.log(error);
    }
  }

  async function cancelAuction(event) {
    try {
      event.preventDefault();
      // Add cancel auction call of trade contract
      // update auction to complete
      const res = await strapi.update("auctions", auction?.data?.id, {
        status: "Completed",
      });
      // console.log(res);
      await updateCollectible({
        variables: {
          "data": {
            putOnSale: false
          },
          "updateCollectibleId": auction?.data?.collectible.data.id
        }
      });
      toast.success("Auction closed successfully");
      setShowConfirmModal(false);
      router.push(`/collectible/${auction?.data?.collectible.data.slug}`);
    } catch (error) {
      toast.error("Error while creating auction");
      console.log(error);
    }
  }

  const handleSubmitEdit = async (event) => {
    // const { target } = e;
    event.preventDefault();
    // console.log(event);
    if (!walletData.isConnected) {
      toast.error("Please connect wallet first");
      return;
    } // chnage network
    if (auction?.data?.collectible.data.collection.data.networkType === "Ethereum") {
      if (!await switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
        // ethereum testnet
        return;
      }
    } else if (auction?.data?.collectible.data.collection.data.networkType === "Polygon") {
      if (!await switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
        // polygon testnet
        return;
      }
    } else if (auction?.data?.collectible.data.collection.data.networkType === "Binance") {
      if (!await switchNetwork(BINANCE_NETWORK_CHAIN_ID)) {
        // polygon testnet
        return;
      }
    }

    const data = {
      price: event.target.price.value,
      startTimestamp: event.target.startDate.value,
      endTimeStamp: event.target.endDate.value,
      sellType: auction.data.sellType,
      paymentToken: event.target.paymentToken.value,
      currency: event.target.paymentToken?.options[event.target?.paymentToken?.selectedIndex]?.text ? event.target.paymentToken.options[event.target.paymentToken.selectedIndex].text : event.target.currency.value,
      quantity: event.target.quantity?.value ? event.target.quantity?.value : 1
    };
    // console.log(event.target.paymentToken.options[event.target.paymentToken.selectedIndex].text);
    // console.log(data);
    updateAuctionData(data);
  };

  return (
    <div className={clsx("product-details-area", space === 1 && "rn-section-gapTop", className)}>
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-7 col-md-12 col-sm-12">
            <Sticky>
              <GalleryTab images={[auction?.data?.collectible.data.image.data ? { data: { id: "image_url", url: auction?.data?.collectible.data.image.data.url, alternativeText: "Image URL" } } : { data: { id: "image_url", url: auction?.data?.collectible.data?.image_url, alternativeText: "Image URL" } }, auction?.data?.collectible.data.front_image_url ? { data: { id: "front_image_url", url: auction?.data?.collectible.data.front_image_url, alternativeText: "Front Image" } } : null, auction?.data?.collectible.data.back_image_url ? { data: { id: "back_image_url", url: auction?.data?.collectible.data.back_image_url, alternativeText: "Back Image" } } : null]} />
            </Sticky>
          </div>
          <div className="col-lg-5 col-md-12 col-sm-12 mt_md--50 mt_sm--60">
            <div className="rn-pd-content-area">
              <ProductTitle title={auction?.data?.collectible.data?.name || "Untitled NFT"} likeCount={auction?.data?.collectible.data?.size} />
              <span className="bid">
                Price{" "}
                <span className="price">
                  {auction?.data?.status == "Live" ? auction?.data?.bidPrice : auction?.data?.collectible.data.price}{" "}
                  {auction?.data?.priceCurrency}
                </span>
              </span>
              <h6 className="title-name">{`${auction?.data?.collectible.data.description.substring(0, 110)}...`}</h6>
              <div className="catagory-collection">
                <ProductCategory owner={auction?.data?.collectible.data.collection} royalty={auction?.data?.royalty} />
                <ProductCollection collection={auction?.data?.collectible.data.collection} />
              </div>
              <div>
                {auction?.data?.walletAddress == walletData.account && auction?.data?.status == "Live" ? (
                  <div className="rn-bid-details">
                    <div className="row">
                      <div className="col-md-6">
                        <Button onClick={() => auction.data.sellType == "FixedPrice" ? handleDirectSaleModal(true) : handleTimeAuctionModal(true)}>Edit Auction</Button>
                      </div>
                      <div className="col-md-6">
                        <Button onClick={() => setShowConfirmModal(true)}>Cancel Auction</Button>
                      </div>
                    </div>
                  </div>
                ) : <></>}
              </div>
              <div className="rn-bid-details">
                <BidTab
                  bids={auction.data.sellType == "FixedPrice" ? null : auction?.data?.biddings.data}
                  owner={auction?.data?.walletAddress}
                  supply={auction?.data?.collectible.data.supply}
                  product={auction?.data?.collectible.data}
                  auction={auction}
                  refreshPageData={refreshPageData}
                  properties={auction?.data?.collectible.data?.collectibleProperties?.data}
                  tags={auction?.data?.collectible.data?.tags}
                  history={auction?.data?.collectible.data?.owner_histories?.data}
                  erc1155MyBalance={erc1155MyBalance}
                />
                {auction?.data?.status == "Live" && (
                  <PlaceBet
                    highest_bid={{
                      amount: auction?.data?.bidPrice,
                      priceCurrency: auction?.data?.priceCurrency,
                      quantity: auction?.data?.quantity,
                      remainingQuantity: auction?.data?.remainingQuantity
                    }}
                    auction_date={auction?.data?.endTimeStamp}
                    product={auction?.data?.collectible.data}
                    auction={auction}
                    refreshPageData={refreshPageData}
                    isOwner={auction?.data?.walletAddress == walletData.account}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DirectSalesModal
        show={showDirectSalesModal}
        handleModal={handleDirectSaleModal}
        supply={auction?.data?.collectible.data.supply}
        maxQuantity={auction?.data?.collectible.data.supply > 1 ? erc1155MyBalance : auction?.data?.collectible.data.supply}
        handleSubmit={handleSubmitEdit}
        paymentTokensList={auction?.data?.collectible.data.collection?.data?.paymentTokens?.data}
        auctionData={auction?.data}
      />
      <TimeAuctionModal
        show={showTimeAuctionModal}
        handleModal={handleTimeAuctionModal}
        supply={auction?.data?.collectible.data.supply}
        maxQuantity={auction?.data?.collectible.data.supply > 1 ? erc1155MyBalance : auction?.data?.collectible.data.supply}
        handleSubmit={handleSubmitEdit}
        paymentTokensList={auction?.data?.collectible.data.collection?.data?.paymentTokens?.data}
        auctionData={auction?.data}
      />
      <ConfirmModal
        show={showConfirmModal}
        handleModal={handleConfirmModal}
        headingText={"Do you really want to cancel this auction?"}
        handleSubmit={cancelAuction}
      />
    </div>
  );
};

AuctionDetailsArea.propTypes = {
  space: PropTypes.oneOf([1, 2]),
  className: PropTypes.string,
  product: PropTypes.shape({
    __typename: PropTypes.string,
    attributes: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      likeCount: PropTypes.number,
      price: PropTypes.shape({
        amount: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired
      }).isRequired,
      owner: PropTypes.shape({}),
      collection: PropTypes.shape({}),
      properties: PropTypes.arrayOf(PropTypes.shape({})),
      tags: PropTypes.arrayOf(PropTypes.shape({})),
      history: PropTypes.arrayOf(PropTypes.shape({})),
      highest_bid: PropTypes.shape({}),
      auction_date: PropTypes.string,
      images: PropTypes.arrayOf(ImageType)
    }),
  }).isRequired,
};

AuctionDetailsArea.defaultProps = {
  space: 1
};

export default AuctionDetailsArea;

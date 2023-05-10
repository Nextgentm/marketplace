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
import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import DirectSalesModal from "@components/modals/direct-sales";
import TimeAuctionModal from "@components/modals/time-auction";
import TransferPopupModal from "@components/modals/transfer";
import { getERC1155Balance, validateInputAddresses } from "../../lib/BlokchainHelperFunctions";

import ERC721Contract from "../../contracts/json/erc721.json";
import ERC1155Contract from "../../contracts/json/erc1155.json";
import TradeContract from "../../contracts/json/trade.json";
import TransferProxy from "../../contracts/json/TransferProxy.json";
import { useMutation } from "@apollo/client";
import { UPDATE_COLLECTIBLE } from "src/graphql/mutation/collectible/updateCollectible";
import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";
import strapi from "@utils/strapi";

// Demo Image

const AuctionDetailsArea = ({ space, className, auction }) => {

  const { walletData, setWalletData } = useContext(AppData);

  const [updateCollectible, { data: updatedCollectible }] = useMutation(UPDATE_COLLECTIBLE);
  const [createOwnerHistory, { data: createdOwnerHistory }] = useMutation(CREATE_OWNER_HISTORY);

  const router = useRouter();
  const [erc1155MyBalance, setERC1155MyBalance] = useState(0);

  useEffect(() => {
    // if (updatedCollectible) {
    //   console.log(updatedCollectible);
    // }
    // console.log(updatedCollectible);
  }, [updatedCollectible]);

  useEffect(() => {
    if (walletData.isConnected) {
      if (walletData.account) {
        if (auction?.data?.collectible.data.collection.data.collectionType === "Multiple") {
          // check is Admin
          const signer = walletData.provider.getSigner();
          const contractAddress = auction?.data?.collectible.data?.collection?.data?.contractAddress1155;
          getERC1155Balance(walletData.ethers, walletData.account, contractAddress, auction?.data?.collectible.data.nftID, signer).then((balance) => {
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
  }, [walletData])

  return (
    <div className={clsx("product-details-area", space === 1 && "rn-section-gapTop", className)}>
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-7 col-md-12 col-sm-12">
            <Sticky>
              <GalleryTab images={{ data: auction?.data?.collectible.data.image.data }} />
            </Sticky>
          </div>
          <div className="col-lg-5 col-md-12 col-sm-12 mt_md--50 mt_sm--60">
            <div className="rn-pd-content-area">
              <ProductTitle title={auction?.data?.collectible.data?.name || "Untitled NFT"} likeCount={auction?.data?.collectible.data?.size} />
              <span className="bid">
                Price{" "}
                <span className="price">
                  {auction?.data?.status == "Live" ? auction?.data?.bidPrice : auction?.data?.collectible.data.price}
                  {auction?.data?.collectible.data.symbol}
                </span>
              </span>
              <h6 className="title-name">{`${auction?.data?.collectible.data.description.substring(0, 110)}...`}</h6>
              <div className="catagory-collection">
                <ProductCategory owner={auction?.data?.collectible.data.collection} royalty={auction?.data?.royalty} />
                <ProductCollection collection={auction?.data?.collectible.data.collection} />
              </div>
              <div className="rn-bid-details">
                <BidTab
                  bids={auction.data.sellType == "FixedPrice" ? null : auction?.data?.biddings.data}
                  owner={auction?.data?.walletAddress}
                  supply={auction?.data?.collectible.data.supply}
                  product={auction?.data?.collectible.data}
                  auction={auction}
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
                      quantity: auction?.data?.quantity
                    }}
                    auction_date={auction?.data?.endTimeStamp}
                    product={auction?.data?.collectible.data}
                    auction={auction}
                    isOwner={auction?.data?.walletAddress == walletData.account}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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

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
import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import { convertEthertoWei } from "../../../lib/BlokchainHelperFunctions";
import ERC721Contract from "../../../contracts/json/erc721.json";
import ERC1155Contract from "../../../contracts/json/erc1155.json";
import TradeContract from "../../../contracts/json/trade.json";
import TransferProxy from "../../../contracts/json/TransferProxy.json";
import TokenContract from "../../../contracts/json/ERC20token.json";
import { useMutation } from "@apollo/client";
import { UPDATE_COLLECTIBLE } from "src/graphql/mutation/collectible/updateCollectible";
import { UPDATE_BIDDING } from "src/graphql/mutation/bidding.js/updateBidding";
import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";
import strapi from "@utils/strapi";

const TopSeller = ({ name, time, path, image, eth, isVarified, product, auction, id }) => {
  const { walletData, setWalletData } = useContext(AppData);

  const router = useRouter();
  const [updateCollectible, { data: updatedCollectible }] = useMutation(UPDATE_COLLECTIBLE);
  const [updateBidding, { data: updatedBidding }] = useMutation(UPDATE_BIDDING);
  const [createOwnerHistory, { data: createdOwnerHistory }] = useMutation(CREATE_OWNER_HISTORY);

  useEffect(() => {
  }, [updatedCollectible]);

  async function completeAuction() {
    updateCollectible({
      variables: {
        "data": {
          putOnSale: false,
          owner: walletData.account
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
    const res = await strapi.create("auctions", auction.data.id, {
      status: "Completed",
    });
  }

  async function acceptBid() {
    try {
      const signer = walletData.provider.getSigner();
      const seller = auction.data.walletAddress;
      const buyer = name;
      const erc20Address = auction.data.paymentToken?.data?.blockchain;
      const nftAddress =
        product.collection.data.collectionType === "Single"
          ? product.collection.data.contractAddress
          : product.collection.data.contractAddress1155;
      const nftType = product.collection.data.collectionType === "Single" ? 1 : 0;
      const skipRoyalty = true;
      const unitPrice = `${convertEthertoWei(walletData.ethers, eth)}`;
      const amount = `${parseFloat(auction.data.quantity) * parseFloat(unitPrice)}`;
      const tokenId = `${product.nftID}`;
      const tokenURI = "";
      const supply = `${product.supply ? product.supply : 1}`;
      const royaltyFee = `${product?.royalty ? product?.royalty : 10}`;
      const qty = `${auction.data.quantity ? auction.data.quantity : 1}`;

      // Pull the deployed contract instance
      const tradeContract = new walletData.ethers.Contract(TradeContract.address, TradeContract.abi, signer);

      console.log("Calling direct buy");
      const transaction = await tradeContract.executeBid([
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
      const transactionHash = receipt.transactionHash;
      if (receipt) {
        completeAuction();
        createOwnerHistory({
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
      // console.log(res);
      if (auction.data.sellType === "FixedPrice") {
        toast.success("NFT purchased successfully!");
      } else {
        toast.success("Bidding Accepted successfully!");
      }
      // router.reload();
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
        <div className="top-seller-content">
          <span>
            {eth && (
              <>
                {eth} {auction.data?.priceCurrency} By
                {/* {product.auction.data.priceCurrency} by {name} */}
                {name && <span className="count-number">{name.substr(0, 5) + "..." + name.substr(-5)}</span>}
              </>
            )}
            {/* <Anchor path={path}>{name}</Anchor> */}
          </span>
          {time && <span className="count-number">{new Date(time).toLocaleString()}</span>}
        </div>
        <div className="ms-4 accept-bid-button-div">
          {product.owner === walletData.account && (
            <Button size="lg" onClick={acceptBid}>
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

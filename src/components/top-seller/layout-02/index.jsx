import Image from "next/image";
import PropTypes from "prop-types";
import clsx from "clsx";
import Anchor from "@ui/anchor";

import { useContext } from "react";
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

const TopSeller = ({ name, time, path, image, eth, isVarified, product }) => {
  const { walletData, setWalletData } = useContext(AppData);

  const router = useRouter();

  async function completeAuction() {
    // update collectible putOnSale, saleType to true
    const response = await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/${product.id}`, {
      data: {
        putOnSale: false,
        owner: name
      }
    });
    console.log(response);
    // update collectible putOnSale, saleType to true
    const response2 = await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/biddings/${key}`, {
      data: {
        isAccepted: true
      }
    });
    console.log(response2);
  }

  async function acceptBid() {
    try {
      const signer = walletData.provider.getSigner();
      const seller = product.auction.data.walletAddress;
      const buyer = name;
      const erc20Address = TokenContract.address;
      const nftAddress =
        product.collection.data.collectionType === "Single"
          ? product.collection.data.contractAddress
          : product.collection.data.contractAddress1155;
      const nftType = product.collection.data.collectionType === "Single" ? 1 : 0;
      const skipRoyalty = true;
      const amount = convertEthertoWei(walletData.ethers, eth);
      const tokenId = `${product.nftID}`;
      const tokenURI = "";
      const supply = `${product.supply ? product.supply : 1}`;
      const royaltyFee = `${10}`;
      const qty = `${product.auction.data.quantity ? product.auction.data.quantity : 1}`;
      const unitPrice = `${parseFloat(amount) / parseFloat(product.auction.data.quantity)}`;

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
      if (receipt) {
        completeAuction();
      }
      // console.log(res);
      if (product.auction.data.sellType === "FixedPrice") {
        toast.success("NFT purchased successfully!");
      } else {
        toast.success("Bidding Accepted successfully!");
      }
      router.reload();
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
                {eth} wETH By
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

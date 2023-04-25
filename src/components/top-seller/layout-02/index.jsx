import Image from "next/image";
import PropTypes from "prop-types";
import clsx from "clsx";
import Anchor from "@ui/anchor";

import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { WalletData } from "src/context/wallet-context";
import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import ERC721Contract from "../../../contracts/json/erc721.json";
import ERC1155Contract from "../../../contracts/json/erc1155.json";
import TradeContract from "../../../contracts/json/trade.json";
import TransferProxy from "../../../contracts/json/TransferProxy.json";
import TokenContract from "../../../contracts/json/ERC20token.json";

const TopSeller = ({ name, time, path, image, eth, isVarified, product }) => {
  const { walletData, setWalletData } = useContext(WalletData);

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
      const unitPrice = "1";
      const skipRoyalty = true;
      const amount = `${eth}`;
      const tokenId = `${product.nftID}`;
      const tokenURI = "";
      const supply = `${product.supply ? product.supply : 1}`;
      const royaltyFee = `${10}`;
      const qty = `${product.supply ? product.supply : 1}`;

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
                {eth}
                {/* {product.auction.data.priceCurrency} by {name} */}
              </>
            )}
            <Anchor path={path}>{name}</Anchor>
          </span>
          {time && <span className="count-number">{time}</span>}
          {"   "}
          {product.owner === walletData.account && <Button onClick={acceptBid}> Accept Bid </Button>}
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

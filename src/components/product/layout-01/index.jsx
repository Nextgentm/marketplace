import { useState, useContext } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import ClientAvatar from "@ui/client-avatar";
import ProductBid from "@components/product-bid";
import Button from "@ui/button";
import { ImageType } from "@utils/types";
import { isImgLink } from "@utils/methods";
import PlaceBidModal from "@components/modals/placebid-modal";
import { AppData } from "src/context/app-context";
const CountdownTimer = dynamic(() => import("@ui/countdown/layout-01"), {
  ssr: false
});

const ShareDropdown = dynamic(() => import("@components/share-dropdown"), {
  ssr: false
});



const Product = ({
  overlay,
  title,
  slug,
  latestBid,
  price,
  symbol,
  supply,
  likeCount,
  auction_date,
  image,
  bitCount,
  authors,
  placeBid,
  collectionName,
  isAuction,
  isOpenseaCollectible,
  disableShareDropdown,
  editProductSlug,
  network
}) => {
  const [showBidModal, setShowBidModal] = useState(false);
  const handleBidModal = () => {
    setShowBidModal((prev) => !prev);
  };

  const { userData } = useContext(AppData);

  const CollectiblesEvent = async (event) => {

    console.log(title);
    clevertap.event.push("Marketplace Collectibles", {
      "Button Name": event,
      "Collection Name": collectionName,
      "NFT Name": title,
      "Username": userData?.username,
      "Player ID": userData?.id,
      "Email ID": userData?.email,
      "Mobile No": userData?.username,
      "First name": userData?.fullName,
    });
  };


  return (
    <>
      <div className={clsx("product-style-one", !overlay && "no-overlay", placeBid && "with-placeBid")}>
        <div className="card-thumbnail">
          {image && (
            <Anchor target={isOpenseaCollectible ? "_blank" : "_self"} path={isOpenseaCollectible ? `${slug}` : isAuction ? `${slug}` : `/collectible/${slug}`}>
              {isImgLink(image?.src ? image.src : image) ?
                <Image
                  src={image?.src ? image.src : image}
                  alt={image?.alt || "NFT_portfolio"}
                  width={533}
                  height={533}
                  onClick={() =>
                    CollectiblesEvent("Image Click")
                  }
                /> :
                <video width={"100%"} height={"auto"}>
                  <source src={image?.src ? image.src : image} />
                </video>
              }
            </Anchor>
          )}
          {auction_date && <CountdownTimer date={auction_date} />}
          {placeBid && (
            <Button onClick={handleBidModal} size="small">
              Place Bid
            </Button>
          )}
        </div>
        <div className="product-share-wrapper">
          <div className="profile-share">
            {authors?.map((client) => (
              <ClientAvatar key={client.name} slug={client.slug} name={client.name} image={client.image} />
            ))}
            {bitCount > 0 && <Anchor className="more-author-text" target={isOpenseaCollectible ? "_blank" : "_self"} path={isOpenseaCollectible ? `${slug}` : isAuction ? `${slug}` : `/collectible/${slug}`}>
              {bitCount}+ Place Bit.
            </Anchor>}
          </div>
          {!disableShareDropdown && <ShareDropdown slug={editProductSlug} />}
        </div>
        <Anchor target={isOpenseaCollectible ? "_blank" : "_self"} path={isOpenseaCollectible ? `${slug}` : isAuction ? `${slug}` : `/collectible/${slug}`} >
          <span className="product-name" onClick={() =>
            CollectiblesEvent("Name Click")
          }>{title}</span>
        </Anchor>
        {/* <span className="latest-bid">Highest bid {latestBid}</span> */}
        <span className="latest-bid">From {collectionName}</span><br />
        {/* {supply > 1 && <span className="latest-bid">Supply {supply}</span>} */}
        <ProductBid symbol={symbol} price={price} likeCount={likeCount} network={network} />
      </div>
      <PlaceBidModal show={showBidModal} handleModal={handleBidModal} />
    </>
  );
};

Product.propTypes = {
  overlay: PropTypes.bool,
  title: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  latestBid: PropTypes.string,
  price: PropTypes.number,
  // price: PropTypes.shape({
  //   amount: PropTypes.number.isRequired,
  //   currency: PropTypes.string.isRequired
  // }).isRequired,
  likeCount: PropTypes.number,
  auction_date: PropTypes.string,
  image: PropTypes.oneOfType([PropTypes.shape(), PropTypes.string]),
  authors: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    image: ImageType.isRequired
  }),// PropTypes.arrayOf(),
  bitCount: PropTypes.number,
  placeBid: PropTypes.bool,
  disableShareDropdown: PropTypes.bool
};

Product.defaultProps = {
  overlay: false
};

export default Product;

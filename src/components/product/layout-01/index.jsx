import { useState } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import ClientAvatar from "@ui/client-avatar";
import ProductBid from "@components/product-bid";
import Button from "@ui/button";
import { ImageType } from "@utils/types";
import PlaceBidModal from "@components/modals/placebid-modal";

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
  disableShareDropdown
}) => {
  const [showBidModal, setShowBidModal] = useState(false);
  const handleBidModal = () => {
    setShowBidModal((prev) => !prev);
  };
  return (
    <>
      <div className={clsx("product-style-one", !overlay && "no-overlay", placeBid && "with-placeBid")}>
        <div className="card-thumbnail">
          {image && (
            <Anchor path={`/collectible/${slug}`}>
              <Image
                src={image?.src ? image.src : image}
                alt={image?.alt || "NFT_portfolio"}
                width={533}
                height={533}
              />
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
            {bitCount > 0 && <Anchor className="more-author-text" path={`/collectible/${slug}`}>
              {bitCount}+ Place Bit.
            </Anchor>}
          </div>
          {!disableShareDropdown && <ShareDropdown />}
        </div>
        <Anchor path={`/collectible/${slug}`}>
          <span className="product-name">{title}</span>
        </Anchor>
        {/* <span className="latest-bid">Highest bid {latestBid}</span> */}
        <span className="latest-bid">From {collectionName}</span><br />
        {supply > 1 && <span className="latest-bid">Supply {supply}</span>}
        {likeCount && <ProductBid symbol={symbol} price={price} likeCount={likeCount} />}
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
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      image: ImageType.isRequired
    })
  ),
  bitCount: PropTypes.number,
  placeBid: PropTypes.bool,
  disableShareDropdown: PropTypes.bool
};

Product.defaultProps = {
  overlay: false
};

export default Product;

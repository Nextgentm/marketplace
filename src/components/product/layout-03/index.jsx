import { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import { ImageType } from "@utils/types";
import { isImgLink } from "@utils/methods";
import ProductBid from "@components/product-bid";

const Product = ({ title, slug, collectionName, network, image, multiselection, isSelected, updateSelected, className }) => {

  return (
    <>
      {/*multiselection &&
        <label>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => updateSelected()}
          />
          {isSelected ? "Selected" : "Select"}
        </label>
  */}
      <div className={clsx("product-style-one")}>
        <div className="card-thumbnail">
          {image && (
            <Anchor path={`#`} className={"nav-stake-selection"}>
              {isImgLink(image?.src ? image.src : image) ?
                <>
                  <Image
                    src={image?.src ? image.src : image}
                    alt={image?.alt || "NFT_portfolio"}
                    width={533}
                    height={533}
                  />
                  {multiselection &&
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => updateSelected()}
                      className="stackselection"
                    />
                  }
                </>
                :
                <video width={"100%"} height={"auto"}>
                  <source src={image?.src ? image.src : image} />
                </video>
              }
            </Anchor>
          )}
        </div>
        <div className="read-content">
          <div className="product-share-wrapper">
            <div className="profile-share">
            </div>
            <div className="last-bid">
            </div>
          </div>
          <Anchor path={`#`}>
            <h6 className="title">{title}</h6>
          </Anchor>
          <span className="latest-bid">From {collectionName}</span><br />
        </div>
        <ProductBid network={network} />
      </div>
    </>
  );
};

Product.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  price: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired
  }).isRequired,
  latestBid: PropTypes.string.isRequired,
  image: ImageType.isRequired,
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      image: ImageType.isRequired
    })
  ),
  bitCount: PropTypes.number,
  likeCount: PropTypes.number
};

Product.defaultProps = {
  likeCount: 0
};

export default Product;

import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import { ImageType } from "@utils/types";
import { isImgLink } from "@utils/methods";
import ProductBid from "@components/product-bid";
import { Button } from "react-bootstrap";
import { AppData } from "src/context/app-context";
import { getERC1155Balance } from "src/lib/BlokchainHelperFunctions";

const Product = ({ title, slug, collectionName, network, image,
  multiselection, isSelected, updateSelected,
  contractAddress, nftID, supply }) => {

  const [totalCount, setTotalCount] = useState(supply || 1);
  const [maxCount, setMaxCount] = useState(supply || 1);
  const { walletData, setWalletData } = useContext(AppData);

  useEffect(() => {
    updateMyERC1155Balance();
  }, [walletData]);

  const updateMyERC1155Balance = () => {
    if (walletData.isConnected) {
      if (walletData.account) {
        if (contractAddress) {
          // check ERC1155 Token balance
          getERC1155Balance(walletData, walletData.account, contractAddress, nftID).then((balance) => {
            setTotalCount(balance);
            setMaxCount(balance);
          }).catch((error) => {
            setTotalCount(0);
            setMaxCount(0);
          });
        }
      } else {
        setTotalCount(0);
      }
    } else {
      setTotalCount(0);
    }
  }


  const decrementTotalCount = async () => {
    let _totalCount = totalCount;
    if ((_totalCount - 1) > 0) {
      setTotalCount(_totalCount - 1);
    }
  }

  const incrementTotalCount = async (newValue) => {
    let _totalCount = totalCount;
    if ((_totalCount + 1) <= maxCount) {
      setTotalCount(_totalCount + 1);
    }
  }

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
        <div className="card-thumbnail" onClick={() => updateSelected(totalCount)}>
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
                  {multiselection && isSelected &&
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => updateSelected(totalCount)}
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
        <div className="read-content" onClick={() => updateSelected(totalCount)}>
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
          {contractAddress && <>
            <span>Supply {supply}</span><br />
            <span>Your Balance {totalCount}</span>
          </>}
        </div>
        {isSelected && contractAddress &&
          <div className="row increament_stack">
            <div className="col-md-4">
              <Button onClick={() => decrementTotalCount()}> - </Button>
            </div>
            <div className="col-md-4">
              <span>{totalCount}</span>
            </div>
            <div className="col-md-4">
              <Button onClick={() => incrementTotalCount()}> + </Button>
            </div>
          </div>
        }
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

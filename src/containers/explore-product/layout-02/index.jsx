import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { motion } from "framer-motion";
import SectionTitle from "@components/section-title/layout-02";
import Product from "@components/product/layout-01";
import FilterButtons from "@components/filter-buttons";
import { flatDeep } from "@utils/methods";
import { SectionTitleType, ProductType } from "@utils/types";
import strapi from "@utils/strapi";
import Anchor from "@ui/anchor";

const ExploreProductArea = ({ className, space, data }) => {
  const filters = [...new Set(flatDeep(data?.allCollections.map((item) => item.name) || []))];
  const [collectionSlug, setCollectionSlug] = useState("/collectibles");
  const [products, setProducts] = useState([]);
  useEffect(() => {
    setProducts(data?.products);
  }, [data?.products]);

  const filterHandler = async (filterKey) => {
    const prods = data?.products ? [...data.products] : [];
    if (filterKey === "all") {
      setProducts(data?.products);
      setCollectionSlug("/collectibles");
      return;
    }
    // const filterProds = prods.filter((prod) => prod.collectible.data?.collection?.data?.name.includes(filterKey));
    // setProducts(filterProds);
    const dataCollectiblesFilter = {
      filters: {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
        collectible: {
          collection: {
            name: {
              $eq: filterKey
            }
          }
        }
      },
      populate: {
        collectible: {
          populate: ["image", "collection"]
        },
        biddings: {
          fields: ["id"]
        }
      },
      sort: { collectible: { priority: "asc" }, startTimestamp: "desc" }
    }
    let filterProds = await strapi.find("auctions", dataCollectiblesFilter);
    // console.log(filterProds.meta);
    setProducts(filterProds.data);
    if (filterProds.data.length > 0) {
      setCollectionSlug(`collection/${filterProds?.data[0]?.collectible?.data?.collection?.data?.slug}`);
    }
  };

  return (
    <div className={clsx("rn-product-area masonary-wrapper-activation", space === 1 && "rn-section-gapTop", className)}>
      <div className="container">
        <div className="row align-items-center mb--60">
          <div className="col-lg-4">
            {data?.section_title && <SectionTitle className="mb--0" disableAnimation {...data.section_title} />}
          </div>
          <div className="col-lg-8">
            <FilterButtons buttons={filters} filterHandler={filterHandler} />
          </div>
        </div>
        <div className="col-lg-12">
          {products.length > 0 ?
            <motion.div layout className="isotope-list item-5">
              {products?.slice(0, 10)?.map((prod, index) => (
                <motion.div key={index} className={clsx("grid-item")} layout>
                  <Product
                    isAuction={true}
                    title={prod.collectible?.data?.name}
                    slug={"collectible/" + prod.collectible?.data?.slug + "/auction/" + prod.id}
                    supply={prod?.collectible?.data?.supply}
                    price={prod.bidPrice}
                    symbol={prod.priceCurrency}
                    image={prod.collectible.data?.image?.data ? prod.collectible.data?.image?.data?.url : prod.collectible.data?.image_url}
                    collectionName={prod.collectible.data?.collection?.data?.name}
                    bitCount={prod.sellType == "Bidding" ? prod.biddings?.data.length : 0}
                    latestBid={prod.latestBid}
                    likeCount={prod.likeCount}
                    authors={prod.authors}
                    network={prod.collectible.data?.collection?.data?.networkType}
                  />
                </motion.div>
              ))}
            </motion.div>
            : <p>No item to show</p>}
        </div>
        {products.length > 10 &&
          <div className="col-lg-12 view-more-link">
            <Anchor className="btn-transparent" path={collectionSlug}>
              VIEW MORE
              <i className="feather feather-arrow-right" />
            </Anchor>
          </div>
        }
      </div>
    </div>
  );
};

ExploreProductArea.propTypes = {
  className: PropTypes.string,
  space: PropTypes.oneOf([1, 2]),
  data: PropTypes.shape({
    section_title: SectionTitleType,
    products: PropTypes.arrayOf(PropTypes.shape({
      __typename: PropTypes.string,
      attributes: ProductType
    })).isRequired,
    placeBid: PropTypes.bool
  })
};

ExploreProductArea.defaultProps = {
  space: 1
};

export default ExploreProductArea;

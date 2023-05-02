import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { motion } from "framer-motion";
import SectionTitle from "@components/section-title/layout-02";
import Product from "@components/product/layout-01";
import FilterButtons from "@components/filter-buttons";
import { flatDeep } from "@utils/methods";
import { SectionTitleType, ProductType } from "@utils/types";

const ExploreProductArea = ({ className, space, data }) => {
  const filters = [...new Set(flatDeep(data?.products.map((item) => item.attributes?.collection?.data?.attributes?.name) || []))];
  const [products, setProducts] = useState([]);
  useEffect(() => {
    setProducts(data?.products);
  }, [data?.products]);

  const filterHandler = (filterKey) => {
    const prods = data?.products ? [...data.products] : [];
    if (filterKey === "all") {
      setProducts(data?.products);
      return;
    }
    const filterProds = prods.filter((prod) => prod.attributes?.collection?.data?.attributes?.name.includes(filterKey));
    setProducts(filterProds);
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
          <motion.div layout className="isotope-list item-5">
            {products?.slice(0, 10)?.map((prod, index) => (
              <motion.div key={index} className={clsx("grid-item")} layout>
                <Product
                  title={prod.attributes.name}
                  slug={prod.attributes.slug}
                  price={prod.attributes?.auction?.data?.attributes?.bidPrice}
                  symbol={prod.attributes?.auction?.data?.attributes?.priceCurrency}
                  image={prod.attributes?.image?.data?.attributes?.url}
                  collectionName={prod.attributes?.collection?.data?.attributes?.name}
                  latestBid={prod.latestBid}
                  likeCount={prod.likeCount}
                  authors={prod.authors}
                  bitCount={prod.bitCount}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
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

import PropTypes from "prop-types";
import SortWidget from "./sort";
import CategoryFilter from "./category-filter";
import NetworkFilter from "./network-filter";
import LevelFilter from "./level-filter";
import PriceSort from "./price-sort";
import MarketplaceSort from "./marketplace-sort";
import LanguageFilter from "./language-flter";
import RatingFilter from "./rating-filter";
import PriceRangeFilter from "./price-range-filter";
import SalesTypeSort from "./salestype-sort";

const ProductFilter = ({
  sortHandler,
  checkHandler,
  priceHandler,
  inputs,
  sort,
  categories,
  collectionPage,
  levels,
  auctionfilter,
  inputcheck,
  products,
  routerQuery,
  languages,
  networksList,
  networksCheckHandler
}) => (
  <div className="nu-course-sidebar">
    <SortWidget onChange={sortHandler} value={sort} />
    <MarketplaceSort onChange={sortHandler} value={sort} />
    {networksList && (
      <NetworkFilter
        networks={networksList}
        onChange={networksCheckHandler}
      />
    )}
    {!collectionPage && (
      <CategoryFilter
        categories={inputcheck}
        onChange={checkHandler}
        collectionPage={collectionPage}
        products={products}
        routerQuery={routerQuery}
      />
    )}
    {/* {!collectionPage && (
      <CategoryFilter
        categories={inputcheck}
        onChange={checkHandler}
        collectionPage={collectionPage}
        products={products}
      />
    )} */}
    <PriceSort onChange={sortHandler} value={sort} />
    <SalesTypeSort onChange={auctionfilter} value={sort} />
    {/* <RatingFilter onChange={filterHandler} /> */}
    <PriceRangeFilter values={inputs.price} onChange={priceHandler} />
  </div>
);

ProductFilter.propTypes = {
  sortHandler: PropTypes.func,
  checkHandler: PropTypes.func,
  priceHandler: PropTypes.func,
  inputs: PropTypes.shape({
    price: PropTypes.arrayOf(PropTypes.number)
  }),
  sort: PropTypes.string,
  categories: PropTypes.shape({}),
  levels: PropTypes.arrayOf(PropTypes.string),
  languages: PropTypes.arrayOf(PropTypes.string)
};

export default ProductFilter;

import PropTypes from "prop-types";
import SortWidget from "./sort";
import CategoryFilter from "./category-filter";
import LevelFilter from "./level-filter";
import PriceSort from "./price-sort";
import LanguageFilter from "./language-flter";
import RatingFilter from "./rating-filter";
import PriceRangeFilter from "./price-range-filter";

const ProductFilter = ({
  sortHandler,
  filterHandler,
  priceHandler,
  inputs,
  sort,
  categories,
  collectionPage,
  levels,
  languages
}) => (
  <div className="nu-course-sidebar">
    {console.log("filterHandler", filterHandler)}
    {console.log("inputsinputs", inputs)}
    <SortWidget onChange={sortHandler} value={sort} />
    {/* {!collectionPage && <CategoryFilter categories={categories} onChange={filterHandler} />} */}
    <PriceSort onChange={sortHandler} value={sort} />
    {/* <RatingFilter onChange={filterHandler} /> */}
    <PriceRangeFilter values={inputs.price} onChange={priceHandler} />
  </div>
);

ProductFilter.propTypes = {
  sortHandler: PropTypes.func,
  filterHandler: PropTypes.func,
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

import PropTypes from "prop-types";

const MarketplaceSort = ({ onChange, value }) => {
  const changeHandler = (e) => {
    const { value: currentValue } = e.target;
    onChange(currentValue);
  };
  return (
    <div className="nuron-expo-filter-widget widget-shortby mt--30">
      <div className="inner">
        <h5 className="widget-title">Sort By Marketplace</h5>
        <div className="content">
          <div className="nuron-form-check">
            <input
              type="radio"
              value="other-marketplace"
              name="sort"
              id="price-check1"
              checked={value === "other-marketplace"}
              onChange={changeHandler}
            />
            <label htmlFor="price-check1">Other Marketplace</label>
          </div>
          <div className="nuron-form-check">
            <input
              type="radio"
              value="lm-marketplace"
              name="sort"
              id="price-check2"
              checked={value === "lm-marketplace"}
              onChange={changeHandler}
            />
            <label htmlFor="price-check2">LM-Marketplace</label>
          </div>
        </div>
      </div>
    </div>
  );
};

MarketplaceSort.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string
};

export default MarketplaceSort;

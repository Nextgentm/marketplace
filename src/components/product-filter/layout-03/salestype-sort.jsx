import PropTypes from "prop-types";

const SalesTypeSort = ({ onChange, value }) => {
  const changeHandler = (e) => {
    const { value: currentValue } = e.target;
    console.log("currentValue", currentValue);
    onChange(currentValue);
  };
  return (
    <div className="nuron-expo-filter-widget widget-shortby mt--30">
      <div className="inner">
        <h5 className="widget-title">Sort By Sales Type</h5>
        <div className="content">
          <div className="nuron-form-check">
            <input
              type="radio"
              value="Auction"
              name="sort"
              id="type-check1"
              checked={value === "Auction"}
              onChange={changeHandler}
            />
            <label htmlFor="type-check1">Auction</label>
          </div>
          <div className="nuron-form-check">
            <input
              type="radio"
              value="Fixed-price"
              name="sort"
              id="type-check2"
              checked={value === "Fixed-price"}
              onChange={changeHandler}
            />
            <label htmlFor="type-check2">Fixed price</label>
          </div>
        </div>
      </div>
    </div>
  );
};

SalesTypeSort.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string
};

export default SalesTypeSort;

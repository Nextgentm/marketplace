import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CategoryFilter = ({ categories, onChange, products, collectionPage, routerQuery }) => {
  const [isCheck, setIsCheck] = useState([]);

  const handleClick = (e) => {
    const { value, checked } = e.target;
    setIsCheck((prevState) => {
      if (checked) {
        return [...prevState, value];
      } else {
        return prevState.filter((item) => item !== value);
      }
    });
  };

  useEffect(() => {
    onChange(isCheck);
  }, [isCheck]);

  useEffect(() => {
    setIsCheck(routerQuery); // set "Collect12" as checked by default
  }, []);

  return (
    <div className="nuron-expo-filter-widget widget-category mt--30">
      <div className="inner">
        <h5 className="widget-title">Collections</h5>
        <div className="content">
          {Object.entries(categories).map(([key, value]) => (
            <div className="nuron-form-check" key={key}>
              <input
                type="checkbox"
                name="categories"
                value={key}
                onChange={handleClick}
                id={`cat-check-${key}`}
                checked={isCheck.includes(key)}
              />
              <label htmlFor={`cat-check-${key}`} className="text-capitalize">
                {key} <span>({value})</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

CategoryFilter.propTypes = {
  categories: PropTypes.shape({}),
  onChange: PropTypes.func
};

export default CategoryFilter;

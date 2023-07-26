import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CardTypeFilter = ({ cardType, onChange }) => {
    const [isCheck, setIsCheck] = useState([]);

    const handleClick = (e) => {

        const { value, checked } = e.target;
        setIsCheck([...isCheck, value]);
        if (!checked) {
            setIsCheck(isCheck.filter((item) => item !== value));
        }
    };
    useEffect(() => {
        onChange(isCheck);
    }, [isCheck]);

    return (
        <div className="nuron-expo-filter-widget widget-category mt--30">
            <div className="inner">
                <h5 className="widget-title">Card Type</h5>
                <div className="content">
                    {cardType.map((ele, index) => (
                        <div className="nuron-form-check" key={index}>
                            <input type="checkbox" name="categories" value={ele.name} onChange={handleClick} id={`cat-check-${ele.name}`} />
                            <label htmlFor={`cat-check-${ele.name}`} className="text-capitalize">
                                {ele.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

CardTypeFilter.propTypes = {
    cardType: PropTypes.shape({}),
    onChange: PropTypes.func
};

export default CardTypeFilter;
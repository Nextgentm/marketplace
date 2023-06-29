import { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Slider, { SliderItem } from "@ui/slider";

const SliderOptions = {
  infinite: true,
  slidesToShow: 4,
  slidesToScroll: 2,
  arrows: true,
  responsive: [
    {
      breakpoint: 1399,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 576,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: false,
        arrows: true
      }
    }
  ]
};

const FilterButtons = ({ buttons, filterHandler }) => {
  const [active, setActive] = useState("all");
  const activeHandler = (filterKey) => {
    setActive(filterKey);
    filterHandler(filterKey);
  };
  return (
    <div className="button-group lm-explore-product isotop-filter filters-button-group d-flex justify-content-start justify-content-lg-end mt_md--30 mt_sm--30">
      <Slider
        options={SliderOptions}
        className="banner-one-slick slick-arrow-style-one rn-slick-dot-style slick-gutter-15"
      >


        <button type="button" className={clsx(active === "all" && "is-checked")} onClick={() => activeHandler("all")}>
          All
        </button>
        {buttons.map((button, index) => (
          <SliderItem key={index} className="single-slide-product">
            <button
              key={button}
              type="button"
              className={clsx(button === active && "is-checked")}
              onClick={() => activeHandler(button)}
            >
              {button}
            </button>
          </SliderItem>
        ))}



      </Slider>
    </div>
  );
};

FilterButtons.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.string),
  filterHandler: PropTypes.func
};

export default FilterButtons;

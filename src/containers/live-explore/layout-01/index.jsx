import PropTypes from "prop-types";
import clsx from "clsx";
import SectionTitle from "@components/section-title/layout-01";
import Product from "@components/product/layout-01";
import Slider, { SliderItem } from "@ui/slider";
import { SectionTitleType, ProductType } from "@utils/types";

const SliderOptions = {
  infinite: true,
  slidesToShow: 5,
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
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        arrows: false
      }
    }
  ]
};

const LiveExploreArea = ({ data, className, space }) => (
  data?.products &&
  <div className={clsx("rn-live-bidding-area", space === 1 && "rn-section-gapTop", className)}>
    <div className="container">
      {data?.products && (
        <div className="row mb--50">
          <div className="col-lg-12">
            <SectionTitle {...data.section_title} />
          </div>
        </div>
      )}
      {data?.products && (
        <div className="row">
          <div className="col-lg-12">
            {data.products.length > 0 ?
              <Slider
                options={SliderOptions}
                className="banner-one-slick slick-arrow-style-one rn-slick-dot-style slick-gutter-15"
              >
                {data.products.map((prod, index) => (
                  <SliderItem key={index} className="single-slide-product">
                    <Product
                      overlay
                      placeBid={false}
                      isAuction={true}
                      title={prod.collectible?.data?.name}
                      slug={"/collectible/" + prod.collectible?.data?.slug + "/auction/" + prod.id}
                      supply={prod?.collectible?.data?.supply}
                      price={prod.bidPrice}
                      symbol={prod.priceCurrency}
                      auction_date={prod.endTimeStamp}
                      image={prod.collectible.data?.image?.data?.url}
                      collectionName={prod.collectible.data?.collection?.data?.name}
                      bitCount={prod.biddings?.data.length}
                      latestBid={prod.latestBid}
                      likeCount={prod.likeCount}
                      authors={prod.authors}
                      network={prod.collectible.data?.collection?.data?.networkType}
                    />
                  </SliderItem>
                ))}
              </Slider>
              : <p>No item to show</p>}
          </div>
        </div>
      )}
    </div>
  </div>
);

LiveExploreArea.propTypes = {
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

LiveExploreArea.defaultProps = {
  space: 1
};

export default LiveExploreArea;

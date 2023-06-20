import PropTypes from "prop-types";
import clsx from "clsx";
import Product from "@components/product/layout-01";
import { ProductType } from "@utils/types";

const AuctionArea = ({ space, className, collectiblePage, data }) => (
  <div className={clsx("product-area", space === 1 && "rn-section-gapTop", className)}>
    <div className="container">
      <div className="row mb--30 align-items-center">
        <div className="col-12">
          <h3 className="title mb--0" data-sal-delay="150" data-sal="slide-up" data-sal-duration="800">
            {data?.section_title.title}
          </h3>
        </div>
      </div>
      <div className="row g-5">
        {data?.auctions?.map((auction) => (
          <div
            key={auction.id}
            data-sal="slide-up"
            data-sal-delay="150"
            data-sal-duration="800"
            className="col-5 col-lg-4 col-md-6 col-sm-6 col-12"
          >
            <Product
              title={auction.collectible?.data?.name || "Untitled NFT"}
              slug={collectiblePage ? auction.collectible?.data?.slug : auction.id.toString()}
              collectionName={auction.collectible?.data?.collection?.data?.name}
              latestBid={auction.latestBid || "N/A"}
              price={auction.bidPrice || "-"}
              symbol={auction.priceCurrency || ""}
              likeCount={auction.likeCount}
              auction_date={auction.auction_date}
              image={auction.collectible?.data?.image?.data ? auction.collectible?.data?.image?.data?.url : auction.collectible?.data?.image_url}
              bitCount={auction.biddings.length}
              isAuction={true}
              network={auction.collectible.data?.collection?.data?.networkType}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

AuctionArea.propTypes = {
  space: PropTypes.oneOf([1, 2]),
  className: PropTypes.string,
  data: PropTypes.shape({
    section_title: PropTypes.shape({
      title: PropTypes.string
    }),
    products: PropTypes.arrayOf(ProductType)
  })
};

AuctionArea.defaultProps = {
  space: 1
};

export default AuctionArea;

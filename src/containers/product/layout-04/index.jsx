import PropTypes from "prop-types";
import clsx from "clsx";
import Product from "@components/product/layout-01";
import SectionTitle from "@components/section-title/layout-02";
import Anchor from "@ui/anchor";
import { ProductType, SectionTitleType } from "@utils/types";

const ProductArea = ({ space, className, data }) =>
  data?.products && (
    <div className={clsx("rn-new-items", space === 1 && "rn-section-gapTop", className)}>
      <div className="container">
        <div className="row mb--50 align-items-center">
          {data?.products && (
            <div className="col-lg-6 col-md-6 col-sm-6 col-12">
              <SectionTitle {...data.section_title} className="mb-0" />
            </div>
          )}

          {data?.products?.length > 4 && (
            <div className="col-lg-6 col-md-6 col-sm-6 col-12 mt_mobile--15">
              <div
                className="view-more-btn text-start text-sm-end"
                data-sal-delay="150"
                data-sal="slide-up"
                data-sal-duration="800"
              >
                <Anchor className="btn-transparent" path="/collectibles?sort=newest">
                  VIEW ALL
                  <i className="feather feather-arrow-right" />
                </Anchor>
              </div>
            </div>
          )}
        </div>
        {data?.products.length > 0 ? (
          <div className="row g-5">
            {data.products.slice(0, 5).map((prod, index) => (
              <div
                key={index}
                data-sal="slide-up"
                data-sal-delay="150"
                data-sal-duration="800"
                className="col-5 col-lg-4 col-md-6 col-sm-6 col-12"
              >
                {prod.collectible.data?.image?.image_url}
                <Product
                  isAuction={true}
                  title={prod.collectible?.data?.name}
                  slug={"collectible/" + prod.collectible?.data?.slug + "/auction/" + prod.id}
                  supply={prod.collectible?.data?.supply}
                  price={prod.bidPrice}
                  symbol={prod.priceCurrency}
                  image={prod.collectible?.data?.image?.data?.url ? prod.collectible?.data?.image?.data?.url : prod.collectible.data?.image_url}
                  collectionName={prod.collectible.data?.collection?.data?.name}
                  bitCount={prod.sellType == "Bidding" ? prod.biddings?.data.length : 0}
                  latestBid={prod.latestBid}
                  likeCount={prod.likeCount}
                  authors={prod.authors}
                  network={prod.collectible?.data?.collection?.data?.networkType}
                />
              </div>
            ))}
          </div>
        ) : <p>No item to show</p>}
      </div>
    </div>
  );

ProductArea.propTypes = {
  space: PropTypes.oneOf([1, 2]),
  className: PropTypes.string,
  data: PropTypes.shape({
    section_title: SectionTitleType,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        __typename: PropTypes.string,
        attributes: ProductType
      })
    ).isRequired
  })
};

ProductArea.defaultProps = {
  space: 1
};

export default ProductArea;

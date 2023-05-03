import PropTypes from "prop-types";
import clsx from "clsx";
import TabContent from "react-bootstrap/TabContent";
import TabContainer from "react-bootstrap/TabContainer";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import Product from "@components/product/layout-01";
import { ProductType } from "@utils/types";
import { shuffleArray } from "@utils/methods";

const AuthorProfileArea = ({ className, productData }) => (
  <div className={clsx("rn-authore-profile-area", className)}>
    <TabContainer defaultActiveKey="nav-profile">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tab-wrapper-one">
              <nav className="tab-button-one">
                <Nav className="nav nav-tabs" id="nav-tab" role="tablist">
                  <Nav.Link as="button" eventKey="nav-home">
                    On Sale
                  </Nav.Link>
                  <Nav.Link as="button" eventKey="nav-profile">
                    Owned
                  </Nav.Link>
                  <Nav.Link as="button" eventKey="nav-contact">
                    Created
                  </Nav.Link>
                  {/* <Nav.Link
                                            as="button"
                                            eventKey="nav-liked"
                                        >
                                            Liked
                                        </Nav.Link> */}
                </Nav>
              </nav>
            </div>
          </div>
        </div>

        <TabContent className="tab-content rn-bid-content">
          <TabPane className="row d-flex g-5" eventKey="nav-home" id="nav-home">
            {productData?.map(
              (prod, index) =>
                prod.attributes.putOnSale && (
                  <div key={index} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                    <Product
                      // overlay //only onsale && not owner
                      // placeBid //only onsale && not owner
                      title={prod.attributes.name}
                      slug={prod.attributes.slug}
                      price={prod.attributes?.auction?.data?.attributes?.bidPrice}
                      symbol={prod.attributes?.auction?.data?.attributes?.priceCurrency}
                      image={prod.attributes?.image?.data?.attributes?.url}
                      collectionName={prod.attributes?.collection?.data?.attributes?.name}
                      auction_date={prod.attributes?.auction?.data?.attributes?.endTimeStamp}
                      latestBid={prod.latestBid}
                      likeCount={prod.likeCount}
                      authors={prod.authors}
                      bitCount={prod.bitCount}
                      owner={prod.attributes.owner}
                    />
                  </div>
                )
            )}
          </TabPane>
          <TabPane className="row g-5 d-flex" eventKey="nav-profile" id="nav-profile">
            {productData?.map(
              (prod, index) =>
                !prod.attributes.putOnSale && (
                  <div key={index} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                    <Product
                      // overlay //only onsale && not owner
                      // placeBid //only onsale && not owner
                      title={prod.attributes.name}
                      slug={prod.attributes.slug}
                      price={prod.attributes?.auction?.data?.attributes?.bidPrice}
                      symbol={prod.attributes?.auction?.data?.attributes?.priceCurrency}
                      image={prod.attributes?.image?.data?.attributes?.url}
                      collectionName={prod.attributes?.collection?.data?.attributes?.name}
                      auction_date={prod.attributes?.auction?.data?.attributes?.endTimeStamp}
                      latestBid={prod.latestBid}
                      likeCount={prod.likeCount}
                      authors={prod.authors}
                      bitCount={prod.bitCount}
                      owner={prod.attributes.owner}
                    />
                  </div>
                )
            )}
          </TabPane>
          <TabPane className="row g-5 d-flex" eventKey="nav-contact" id="nav-profile">
            {productData?.map(
              (prod, index) =>
                prod.attributes.owner === prod.attributes.creator && (
                  <div key={index} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                    <Product
                      // overlay //only onsale && not owner
                      // placeBid //only onsale && not owner
                      title={prod.attributes.name}
                      slug={prod.attributes.slug}
                      price={prod.attributes?.auction?.data?.attributes?.bidPrice}
                      symbol={prod.attributes?.auction?.data?.attributes?.priceCurrency}
                      image={prod.attributes?.image?.data?.attributes?.url}
                      collectionName={prod.attributes?.collection?.data?.attributes?.name}
                      auction_date={prod.attributes?.auction?.data?.attributes?.endTimeStamp}
                      latestBid={prod.latestBid}
                      likeCount={prod.likeCount}
                      authors={prod.authors}
                      owner={prod.attributes.owner}
                    />
                  </div>
                )
            )}
          </TabPane>
          {/* <TabPane
                            className="row g-5 d-flex"
                            eventKey="nav-liked"
                        >
                            {likedProducts?.map((prod) => (
                                <div
                                    key={prod.id}
                                    className="col-5 col-lg-4 col-md-6 col-sm-6 col-12"
                                >
                                    <Product
                                        overlay
                                        placeBid
                                        title={prod.title}
                                        slug={prod.slug}
                                        latestBid={prod.latestBid}
                                        price={prod.price}
                                        likeCount={prod.likeCount}
                                        auction_date={prod.auction_date}
                                        image={prod.images?.[0]}
                                        authors={prod.authors}
                                        bitCount={prod.bitCount}
                                    />
                                </div>
                            ))}
                        </TabPane> */}
        </TabContent>
      </div>
    </TabContainer>
  </div>
);
AuthorProfileArea.propTypes = {
  className: PropTypes.string,
  productData: PropTypes.arrayOf(PropTypes.shape({
    __typename: PropTypes.string,
    attributes: ProductType
  })),
};
export default AuthorProfileArea;

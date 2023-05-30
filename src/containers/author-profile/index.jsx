import PropTypes from "prop-types";
import clsx from "clsx";
import TabContent from "react-bootstrap/TabContent";
import TabContainer from "react-bootstrap/TabContainer";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import Product from "@components/product/layout-01";
import { ProductType } from "@utils/types";
import { shuffleArray } from "@utils/methods";
import { addressIsAdmin } from "src/lib/BlokchainHelperFunctions";

const AuthorProfileArea = ({ className, productData, allCreatedProductsData, allOnSaleProductsData, isAdminWallet }) => (
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
                  {isAdminWallet && <Nav.Link as="button" eventKey="nav-contact">
                    Created
                  </Nav.Link>}
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
            {allOnSaleProductsData?.map(
              (prod, index) => (
                <div key={index} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                  <Product
                    // overlay //only onsale && not owner
                    // placeBid //only onsale && not owner
                    isAuction={true}
                    title={prod.collectible.data.name}
                    slug={"collectible/" + prod.collectible.data.slug + "/auction/" + prod.id}
                    supply={prod.collectible.data.supply}
                    price={prod.bidPrice}
                    symbol={prod.priceCurrency}
                    image={prod.collectible.data?.image?.data?.url}
                    collectionName={prod.collectible.data?.collection?.data?.name}
                    auction_date={prod.endTimeStamp}
                    bitCount={prod.sellType == "Bidding" ? prod.biddings?.data.length : 0}
                    latestBid={prod.latestBid}
                    likeCount={prod.likeCount}
                    authors={prod.authors}
                    owner={prod.owner}
                  />
                </div>
              )
            )}
          </TabPane>
          <TabPane className="row g-5 d-flex" eventKey="nav-profile" id="nav-profile">
            {productData?.map(
              (prod, index) => (
                <div key={index} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                  <Product
                    // overlay //only onsale && not owner
                    // placeBid //only onsale && not owner
                    title={prod.name}
                    slug={prod.slug}
                    supply={prod.supply}
                    // price={prod.attributes?.auction?.data?.attributes?.bidPrice}
                    // symbol={prod.attributes?.auction?.data?.attributes?.priceCurrency}
                    image={prod.image?.data?.url}
                    collectionName={prod.collection?.data?.name}
                    auction_date={prod.auction?.data?.endTimeStamp}
                    latestBid={prod.latestBid}
                    likeCount={prod.likeCount}
                    authors={prod.authors}
                    owner={prod.owner}
                  />
                </div>
              )
            )}
          </TabPane>
          {isAdminWallet &&
            <TabPane className="row g-5 d-flex" eventKey="nav-contact" id="nav-profile">
              {allCreatedProductsData?.map(
                (prod, index) => (
                  <div key={index} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                    <Product
                      // overlay //only onsale && not owner
                      // placeBid //only onsale && not owner
                      title={prod.name}
                      slug={prod.slug}
                      // price={prod.auction?.data?.bidPrice}
                      // symbol={prod.attributes?.auction?.data?.attributes?.priceCurrency}
                      image={prod.image?.data?.url}
                      collectionName={prod.collection?.data?.name}
                      auction_date={prod.auction?.data?.endTimeStamp}
                      latestBid={prod.latestBid}
                      likeCount={prod.likeCount}
                      authors={prod.authors}
                      owner={prod.owner}
                      editProductSlug={prod.slug}
                    />
                  </div>
                )
              )}
            </TabPane>
          }
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

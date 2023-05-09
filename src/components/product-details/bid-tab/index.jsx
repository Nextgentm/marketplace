import PropTypes from "prop-types";
import clsx from "clsx";
import TabContainer from "react-bootstrap/TabContainer";
import TabContent from "react-bootstrap/TabContent";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import BidsTabContent from "./bids-tab-content";
import DetailsTabContent from "./details-tab-content";
import HistoryTabContent from "./history-tab-content";
import AuctionsTabContent from "./auctions-tab-content";

const BidTab = ({ className, bids, product, auction, allAuctions, supply, owner, properties, tags, history, erc1155MyBalance }) => (
  <TabContainer defaultActiveKey={bids ? "nav-bids" : "nav-details"}>
    <div className={clsx("tab-wrapper-one", className)}>
      <nav className="tab-button-one">
        <Nav as="div" className="nav-tabs">
          {bids && (
            <Nav.Link as="button" eventKey="nav-bids">
              Bids
            </Nav.Link>
          )}
          <Nav.Link as="button" eventKey="nav-details">
            Details
          </Nav.Link>
          {allAuctions &&
            <Nav.Link as="button" eventKey="nav-auctions">
              Live Sale
            </Nav.Link>
          }
          {history && (
            <Nav.Link as="button" eventKey="nav-histroy">
              History
            </Nav.Link>
          )}
        </Nav>
      </nav>
      <TabContent className="rn-bid-content">
        {bids && (
          <TabPane eventKey="nav-bids">
            <BidsTabContent bids={bids} product={product} auction={auction} />
          </TabPane>
        )}
        <TabPane eventKey="nav-details">
          <DetailsTabContent owner={owner} properties={properties} tags={tags} supply={supply} erc1155MyBalance={erc1155MyBalance} />
        </TabPane>
        <TabPane eventKey="nav-auctions">
          {allAuctions && <AuctionsTabContent auctions={allAuctions} productSlug={product.slug} />}
        </TabPane>
        {history && (
          <TabPane eventKey="nav-histroy">
            <HistoryTabContent history={history} />
          </TabPane>
        )}
      </TabContent>
    </div>
  </TabContainer>
);

BidTab.propTypes = {
  className: PropTypes.string,
  bids: PropTypes.arrayOf(PropTypes.shape({})),
  owner: PropTypes.string,//PropTypes.shape({}),
  properties: PropTypes.arrayOf(PropTypes.shape({})),
  tags: PropTypes.arrayOf(PropTypes.shape({})),
  history: PropTypes.arrayOf(PropTypes.shape({}))
};

export default BidTab;

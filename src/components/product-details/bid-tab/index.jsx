import PropTypes from "prop-types";
import clsx from "clsx";
import TabContainer from "react-bootstrap/TabContainer";
import TabContent from "react-bootstrap/TabContent";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import BidsTabContent from "./bids-tab-content";
import DetailsTabContent from "./details-tab-content";
import HistoryTabContent from "./history-tab-content";

const BidTab = ({ className, bids, product, owner, properties, tags, history }) => (
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
            <BidsTabContent bids={bids} product={product} />
          </TabPane>
        )}
        <TabPane eventKey="nav-details">
          <DetailsTabContent owner={owner} properties={properties} tags={tags} supply={product.supply} />
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
  owner: PropTypes.shape({}),
  properties: PropTypes.arrayOf(PropTypes.shape({})),
  tags: PropTypes.arrayOf(PropTypes.shape({})),
  history: PropTypes.arrayOf(PropTypes.shape({}))
};

export default BidTab;

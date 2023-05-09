import PropTypes from "prop-types";
import { IDType, ImageType } from "@utils/types";
import { Table } from "react-bootstrap";
import { walletAddressShortForm, transactionHashShortForm } from "../../../utils/blockchain";
import Anchor from "@ui/anchor";

const AuctionsTabContent = ({ auctions }) => {

  return (
    <div className="history-table pt-4">
      {auctions?.map((item, index) => (
        item.status == "Live" &&
        <div key={index}>
          <Anchor path={"/auction/" + item.id}>
            <span>{item.sellType == "Bidding" ? "Bidding Auction" : "Fixed Price"} From {walletAddressShortForm(item.walletAddress)} for price {(item.bidPrice / item.quantity)} {item.priceCurrency}</span><br />
            <span>Remaining Quantity: {item.remainingQuantity}</span>
            <hr />
          </Anchor>
        </div>
      ))}
    </div>
  );
};

AuctionsTabContent.propTypes = {
  auctions: PropTypes.arrayOf(
    PropTypes.shape({
      id: IDType.isRequired,
      user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        image: ImageType.isRequired
      }),
      amount: PropTypes.string.isRequired,
      bidAt: PropTypes.string.isRequired
    })
  )
};

export default AuctionsTabContent;

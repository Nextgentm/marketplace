import PropTypes from "prop-types";
import { IDType, ImageType } from "@utils/types";
import { Table } from "react-bootstrap";
import { walletAddressShortForm, transactionHashShortForm } from "../../../utils/blockchain";
import Anchor from "@ui/anchor";
import Button from "@ui/button";
import { useContext } from "react";
import { AppData } from "src/context/app-context";

const AuctionsTabContent = ({ auctions, productSlug }) => {

  const { walletData, setWalletData } = useContext(AppData);

  return (
    <div className="history-table pt-4">
      <Table striped responsive variant="dark">
        <thead>
          <tr>
            <th>Listing Type</th>
            <th>Owner</th>
            <th>Price</th>
            <th colSpan={2}>Remaning Quantity</th>

            {/* <th>Created At</th> */}
          </tr>
        </thead>
        <tbody>
          {auctions?.map((item, index) => (
            <tr key={index}>
              <td>{item.sellType == "Bidding" ? "Bidding Auction" : "Fixed Price"}</td>
              <td>{walletData.account == item?.walletAddress ? "You" : walletAddressShortForm(item?.walletAddress)}</td>
              <td>{item.bidPrice} {item?.priceCurrency}</td>
              <td>{item?.remainingQuantity}</td>
              <td>
                {item?.remainingQuantity > 0 && item?.status == "Live" ?
                  <Anchor target="_self" path={productSlug + "/auction/" + item.id}>
                    <Button>Buy</Button>
                  </Anchor> :
                  <></>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
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

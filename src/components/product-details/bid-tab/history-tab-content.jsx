import PropTypes from "prop-types";
import { IDType, ImageType } from "@utils/types";
import { Table } from "react-bootstrap";
import { walletAddressShortForm, transactionHashShortForm } from "../../../utils/blockchain";

const HistoryTabContent = ({ history }) => {

  return (
    <div className="history-table pt-4">
      <Table striped responsive variant="dark">
        <thead>
          <tr>
            <th>Event</th>
            <th>From WalletAddress</th>
            <th>To WalletAddress</th>
            <th>Quantity</th>
            <th>Transaction Hash</th>
            {/* <th>Created At</th> */}
          </tr>
        </thead>
        <tbody>
          {history?.map((item, index) => (
            <tr key={index}>
              <td>{item?.event}</td>
              <td>{walletAddressShortForm(item?.fromWalletAddress)}</td>
              <td>{walletAddressShortForm(item?.toWalletAddress)}</td>
              <td>{item?.quantity}</td>
              <td>{transactionHashShortForm(item?.transactionHash)}</td>
              {/* <td>{item?.createdAt}</td> */}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

HistoryTabContent.propTypes = {
  history: PropTypes.arrayOf(
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

export default HistoryTabContent;

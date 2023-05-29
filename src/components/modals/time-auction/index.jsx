import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { getTodayDate } from "@utils/methods";

const TimeAuctionModal = ({ show, handleModal, supply, maxQuantity, handleSubmit, paymentTokensList, auctionData }) => {
  return (
    <Modal className="rn-popup-modal placebid-modal-wrapper" show={show} onHide={handleModal} centered>
      {show && (
        <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
          <i className="feather-x" />
        </button>
      )}
      <Modal.Header>
        <h3 className="modal-title">{auctionData ? "Edit " : ""} Time Auction</h3>
      </Modal.Header>
      <Modal.Body>
        <p>Enter price. Your NFT will be pushed in top of marketplace</p>
        <div className="placebid-form-box">
          <form onSubmit={handleSubmit}>
            <h5 className="title">Set initial bid price</h5>
            <div className="bid-content">
              <div className="bid-content-top">
                <div className="bid-content-left">
                  <input id="price" type="number" name="price" step="0.0000001" min="0.000000000000000001" defaultValue={auctionData ? auctionData.bidPrice : "0.01"} required />
                  <input id="currency" type="hidden" value="wETH" />
                  {/* <span>wETH</span> */}
                </div>
              </div>

              <div className="bid-content-mid">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="startDate">Start Date</label>
                    <input type="date" id="startDate" name="startDate" min={getTodayDate()} defaultValue={auctionData ? auctionData.startTimestamp : getTodayDate()} />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="startDate">End Date</label>
                    <input type="date" id="endDate" name="endDate" min={getTodayDate(2)} defaultValue={auctionData ? auctionData.endTimeStamp : getTodayDate(6)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bid-content-mid">
              <div className="row w-100">
                <label htmlFor="paymentToken">Payment Token</label>
                <select id="paymentToken">
                  {paymentTokensList &&
                    paymentTokensList.map((item, index) => (
                      <option value={item.id} key={index} selected={auctionData && auctionData.paymentToken?.data?.id == item.id}> {item.name} </option>
                    ))}
                </select>
              </div>
            </div>

            {supply > 1 && (
              <div className="bid-content-mid">
                <div className="row">
                  <label htmlFor="quantity">Quantity</label>
                  <input type="number" id="quantity" min="1" max={maxQuantity} defaultValue={auctionData ? auctionData.quantity : 1} placeholder="e.g. 10" />
                </div>
              </div>
            )}
            <div className="bit-continue-button">
              <Button size="medium" type="submit" fullwidth>
                {auctionData ? "Update" : "Confirm"}
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

TimeAuctionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleModal: PropTypes.func.isRequired
};
export default TimeAuctionModal;

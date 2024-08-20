import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { AppData } from "src/context/app-context";


const PlaceBidModal = ({ show, handleModal, bidPrice, maxQuantity, supply, currency, handleSubmit, sellType, timeLeft }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <Modal className="rn-popup-modal placebid-modal-wrapper" show={show} onHide={handleModal} centered>
      {show && (
        <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
          <i className="feather-x" />
        </button>
      )}
      <Modal.Header>
        <h3 className="modal-title">{sellType !== "Bidding" ? "Direct Buy" : "Place a bid"}</h3>
        {timeLeft && (<h3 style={{ marginLeft: "auto" }} className="modal-title">Time Left: {formatTime(timeLeft)}</h3>)}
      </Modal.Header>
      <Modal.Body>
        <p>You are about to purchase this product</p>
        <div className="placebid-form-box">
          <form onSubmit={handleSubmit}>
            <h5 className="title">{sellType !== "Bidding" ? "Checkout" : "Your bid"}</h5>
            <div className="bid-content">
              <div className="bid-content-top">
                {sellType !== "Bidding" ? (
                  <div className="row">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      defaultValue={1}
                      placeholder="e.g. 10"
                      max={maxQuantity}
                    />
                  </div>
                ) : (
                  <div className="bid-content-left">
                    <input
                      id="price"
                      type="number"
                      name="price"
                      step="0.0000001"
                      min={bidPrice}
                      required
                    />
                    <span>{currency}</span>
                  </div>
                )}
              </div>

              <div className="bid-content-mid">
                {/* <div className="bid-content-left">
                  <span>Your Balance</span>
                  <span>Service fee</span>
                  <span>Total bid amount</span>
                </div>
                <div className="bid-content-right">
                  <span>9578 wETH</span>
                  <span>10 wETH</span>
                  <span>9588 wETH</span>
                </div> */}
              </div>
            </div>
            <div className="bit-continue-button">
              <Button size="medium" type="submit" fullwidth>
                {sellType !== "Bidding" ? "Buy Now" : "Place a bid"}
              </Button>
              <Button color="primary-alta" size="medium" className="mt--10" onClick={handleModal}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

PlaceBidModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleModal: PropTypes.func.isRequired
};
export default PlaceBidModal;
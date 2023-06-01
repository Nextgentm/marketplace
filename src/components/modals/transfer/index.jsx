import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";

const TransferPopupModal = ({ show, handleModal, supply, maxQuantity, handleSubmit }) => {

  return (
    <Modal className="rn-popup-modal placebid-modal-wrapper" show={show} onHide={handleModal} centered>
      {show && (
        <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
          <i className="feather-x" />
        </button>
      )}
      <Modal.Header>
        <h3 className="modal-title">Transfer token</h3>
      </Modal.Header>
      <Modal.Body>
        <p>You can Transfer tokens from your address to another</p>
        <div className="placebid-form-box">
          <form onSubmit={handleSubmit}>
            <h5 className="title">Receiver address</h5>
            <div className="bid-content">
              <div className="bid-content-top">
                <div className="bid-content-left">
                  <input id="receiver" type="text" name="receiver" required placeholder="Paste Recipient Address" />
                </div>
              </div>

              {supply > 1 && (
                <div className="bid-content-mid">
                  <div className="row">
                    <label htmlFor="quantity">Quantity</label>
                    <input type="number" id="quantity" min="1" max={maxQuantity} placeholder="e.g. 10" />
                  </div>
                </div>
              )}
            </div>
            <div className="bit-continue-button">
              <Button size="medium" type="submit" fullwidth>
                Continue
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

TransferPopupModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleModal: PropTypes.func.isRequired
};
export default TransferPopupModal;

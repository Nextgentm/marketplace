import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";

const ConfirmModal = ({ show, handleModal, headingText, handleSubmit, supply, maxQuantity }) => (
  <Modal className="rn-popup-modal report-modal-wrapper" show={show} onHide={handleModal} centered>
    {show && (
      <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
        <i className="feather-x" />
      </button>
    )}
    <Modal.Header className="report-modal-header">
      <h5 className="modal-title">Are you sure?</h5>
    </Modal.Header>
    <Modal.Body>
      <p>{headingText}
        <br /><span>This process cannot be reverted.</span>
      </p>
      <div className="">
        <form onSubmit={handleSubmit}>
          <div className="row mb--10">
            {supply > 1 && (
              <div className="row">
                <label htmlFor="quantity">Quantity</label>
                <input type="number" id="quantity" min="1" max={maxQuantity} placeholder="e.g. 10" required />
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-md-6">
              <Button color="primary-alta" size="medium" className="mr--10 w-100" onClick={handleModal}>
                No
              </Button>
            </div>
            <div className="col-md-6">
              <Button size="medium" className="mr--10 w-100" type="submit">
                Yes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal.Body>
  </Modal>
);

ConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleModal: PropTypes.func.isRequired
};
export default ConfirmModal;

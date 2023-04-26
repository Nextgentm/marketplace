import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";



const DirectSalesModal = ({ show, handleModal, supply, handleSubmit }) => {

    return (
        <Modal
            className="rn-popup-modal placebid-modal-wrapper"
            show={show}
            onHide={handleModal}
            centered
        >
            {show && (
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleModal}
                >
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header>
                <h3 className="modal-title">Direct Sales</h3>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Enter price. Your NFT will be pushed in top of marketplace
                </p>
                <div className="placebid-form-box">
                    <form onSubmit={handleSubmit}>
                        <h5 className="title">Your bid</h5>
                        <div className="bid-content">
                            <div className="bid-content-top">
                                <div className="bid-content-left">
                                    <input
                                        id="price"
                                        type="number"
                                        name="price"
                                        step="0.0000001"
                                        min="1"
                                        required
                                    />
                                    <input id="currency" type="hidden" value="wETH" />
                                    <span>wETH</span>
                                </div>
                            </div>

                            <div className="bid-content-mid">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label htmlFor="startDate">Start Date</label>
                                        <input type="date" id="startDate" name="startDate" />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="startDate">End Date</label>
                                        <input type="date" id="endDate" name="endDate" />
                                    </div>
                                </div>
                            </div>

                            {supply > 1 && (
                                <div className="bid-content-mid">
                                    <div className="row">
                                        <label htmlFor="quantity">Quantity</label>
                                        <input type="number" id="quantity" min="1" placeholder="e.g. 10" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bit-continue-button">
                            <Button size="medium" type="submit" fullwidth>
                                Confirm
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal.Body>
        </Modal>
    );
};

DirectSalesModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired,
};
export default DirectSalesModal;

import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { DateRangePicker, Stack } from "rsuite";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import addDays from "date-fns/addDays";
import startOfMonth from "date-fns/startOfMonth";
import "rsuite/dist/rsuite.min.css";

const { beforeToday } = DateRangePicker;
const TimeAuctionModal = ({ show, handleModal, product, handleSubmit }) => {
    const predefinedRanges = [
        {
            label: "Today",
            value: [new Date(), new Date()],
            placement: "left",
        },
        {
            label: "This week",
            value: [startOfWeek(new Date()), endOfWeek(new Date())],
            placement: "left",
        },
        {
            label: "This month",
            value: [startOfMonth(new Date()), new Date()],
            placement: "left",
        },
        {
            label: "This year",
            value: [new Date(new Date().getFullYear(), 0, 1), new Date()],
            placement: "left",
        },
        {
            label: "Next week",
            closeOverlay: false,
            value: (value) => {
                const [start = new Date()] = value || [];
                return [
                    addDays(startOfWeek(start, { weekStartsOn: 0 }), 7),
                    addDays(endOfWeek(start, { weekStartsOn: 0 }), 7),
                ];
            },
            appearance: "default",
        },
    ];
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
                <h3 className="modal-title">Time Auction</h3>
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
                                        min={product?.auction?.data?.bidPrice}
                                        required
                                    />
                                    <span>wETH</span>
                                </div>
                            </div>

                            <div className="bid-content-mid">
                                <p>Expiration date</p>
                                <Stack
                                    direction="column"
                                    spacing={8}
                                    alignItems="flex-start"
                                >
                                    <DateRangePicker
                                        ranges={predefinedRanges}
                                        placeholder="Expiration date"
                                        style={{ width: 300 }}
                                    // disabledDate={beforeToday()}
                                    />
                                </Stack>
                            </div>
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

TimeAuctionModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired,
};
export default TimeAuctionModal;

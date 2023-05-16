import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { useState } from "react";
import { networksList } from "@utils/wallet";

const SwitchNetwork = ({ show, handleModal, handleSubmit }) => {

    const [selectNetwork, setSelectNetwork] = useState(false);

    return (
        <Modal className="rn-popup-modal placebid-modal-wrapper" show={show} onHide={handleModal} centered>
            {show && (
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header>
                <h3 className="modal-title">Switch Network</h3>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <div className="switch-network-form-box">
                        <div className="row align-items-center mb--60">
                            {networksList.map((list, index) => <>

                                <div className="col-lg-4 col-3" key={index}>

                                    <div className="nuron-form-check">
                                        <input
                                            type="radio"
                                            name="networkid"
                                            value={list.name}
                                            id={"id" + index}
                                            onClick={() => setSelectNetwork(true)}
                                        />
                                        <label htmlFor={"id" + index}>
                                            <img src={list.image} alt="Image" />
                                            {list.name}
                                        </label>

                                    </div>
                                </div >
                            </>
                            )}
                        </div>
                    </div>
                    <div className="">
                        <Button type="submit" disabled={!selectNetwork}>Change</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal >
    );
};

SwitchNetwork.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired
};
export default SwitchNetwork;

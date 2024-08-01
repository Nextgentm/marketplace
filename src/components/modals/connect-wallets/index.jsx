import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import Link from "next/link";
import { useState } from "react";
import { networksList, walletsList } from "@utils/wallet";


const ConnectWallets = ({ show, handleModal, handleSubmit }) => {

    const [selectTermsAndConditions, setSelectTermsAndConditions] = useState(false);
    const [selectNetwork, setSelectNetwork] = useState(true);
    const [selectWallet, setSelectWallet] = useState(true);

    return (
        <Modal className="rn-popup-modal connect-wallets-wrapper placebid-modal-wrapper" show={show} onHide={handleModal} centered>
            {show && (
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header>
                <h3 className="modal-title">Connect Wallet</h3>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <div className="connect-wallets">
                        <div className="row align-items-center mb--00">
                            <div className="col-md-12">
                                <input
                                    type="checkbox"
                                    name="term-condition"
                                    value="true"
                                    id="term-condition"
                                    onClick={() => setSelectTermsAndConditions(!selectTermsAndConditions)}
                                    checked={selectTermsAndConditions}
                                    required
                                />
                                <label htmlFor="term-condition" className="term">
                                    I read and accept the <><Link href="#">Term of Service</Link> and <Link href="#">Privacy Policy</Link></>
                                </label>
                            </div>
                            <div className="switch-network-form-box choose-network">
                                <h5 className="mb--0 mt--20">Choose Network</h5>
                                <div className="row align-items-center mb--0">
                                    {networksList.map((list, index) => <>
                                        <div className="col-lg-2 col-3" key={index}>
                                            <div className="nuron-form-check">
                                                <input
                                                    type="radio"
                                                    name="networkid"
                                                    value={list.name}
                                                    id={"id" + index}
                                                    onClick={() => setSelectNetwork(true)}
                                                    defaultChecked={index == 0}
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
                            <div className="switch-network-form-box choose-wallet">
                                <h5 className="mb--0 mt--20">Choose Wallet</h5>
                                <div className="row align-items-center mb--20 mt--20">
                                    {walletsList.map((list, index) => <>
                                        <div className="col-lg-3 col-6" key={index}>
                                            <div className="nuron-form-check">
                                                <input
                                                    type="radio"
                                                    name="walletid"
                                                    value={list.name}
                                                    id={"walletid-" + index}
                                                    onClick={() => setSelectWallet(true)}
                                                    defaultChecked={index == 0}
                                                />
                                                <label htmlFor={"walletid-" + index}>
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
                                <Button type="submit" disabled={!(selectTermsAndConditions && selectNetwork && selectWallet)}>Connect</Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal.Body>
        </Modal >
    );
};

ConnectWallets.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired
};
export default ConnectWallets;

import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import Link from "next/link";
const ConnectWallets = ({ show, handleModal, handleSubmit }) => {

    const cryptoList = [{
        name: "Ethereum",
        image: "/images/connect/ethereum.png"
    },
    {
        name: "BSC",
        image: "/images/connect/binance.png"
    },
    {
        name: "Polygon",
        image: "/images/connect/polygon.png"
    },
    {
        name: "Avalanche",
        image: "/images/connect/avalanche.png"
    },
    {
        name: "Arbitrum",
        image: "/images/connect/arbitrum.webp"
    }
    ];

    const connectWallet = [{
        name: "MetaMask",
        image: "/images/connect/fox.png"
    },
    {
        name: "WalletConnect",
        image: "/images/connect/WalletConnect.png"
    },
    {
        name: "BSC Wallet",
        image: "/images/connect/binance.png"
    },
    {
        name: "Coinbase Wallet",
        image: "/images/connect/coinbase.png"
    }
    ];
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
                                />
                                <label htmlFor="term-condition" className="term">
                                    I read and accept the <><Link href="#">Term of Service</Link> and <Link href="#">Privacy Policy</Link></>
                                </label>
                            </div>
                            <div className="switch-network-form-box choose-network">
                                <h5 className="mb--0 mt--20">Choose Network</h5>
                                <div className="row align-items-center mb--0">
                                    {cryptoList.map((list, index) => <>
                                        <div className="col-lg-2 col-3">
                                            <div className="nuron-form-check">
                                                <input
                                                    type="radio"
                                                    name="networkid"
                                                    value="all"
                                                    id={"id" + index}
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
                                    {connectWallet.map((list, index) => <>
                                        <div className="col-lg-3 col-6">
                                            <div className="nuron-form-check">
                                                <input
                                                    type="radio"
                                                    name="walletid"
                                                    id={"walletid-" + index}
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

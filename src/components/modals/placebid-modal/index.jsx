import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { WalletData } from "src/context/wallet-context";
import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import ERC721Contract from "../../../contracts/json/erc721.json";
import ERC1155Contract from "../../../contracts/json/erc1155.json";
import TradeContract from "../../../contracts/json/trade.json";
import TransferProxy from "../../../contracts/json/TransferProxy.json";
import TokenContract from "../../../contracts/json/ERC20token.json";

const PlaceBidModal = ({ show, handleModal, product, handleSubmit }) => {
  const { walletData, setWalletData } = useContext(WalletData);

  return (
    <Modal className="rn-popup-modal placebid-modal-wrapper" show={show} onHide={handleModal} centered>
      {show && (
        <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
          <i className="feather-x" />
        </button>
      )}
      <Modal.Header>
        <h3 className="modal-title">Place a bid</h3>
      </Modal.Header>
      <Modal.Body>
        <p>You are about to purchase This Product Form Nuron</p>
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
                <div className="bid-content-left">
                  <span>Your Balance</span>
                  <span>Service fee</span>
                  <span>Total bid amount</span>
                </div>
                <div className="bid-content-right">
                  <span>9578 wETH</span>
                  <span>10 wETH</span>
                  <span>9588 wETH</span>
                </div>
              </div>
            </div>
            <div className="bit-continue-button">
              <Button size="medium" type="submit" fullwidth>
                Place a bid
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

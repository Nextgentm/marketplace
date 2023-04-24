import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { WalletData } from "src/context/wallet-context";
import {
    ETHEREUM_NETWORK_CHAIN_ID,
    POLYGON_NETWORK_CHAIN_ID,
} from "src/lib/constants";
import ERC721Contract from "../../../contracts/json/erc721.json";
import ERC1155Contract from "../../../contracts/json/erc1155.json";
import TradeContract from "../../../contracts/json/trade.json";
import TransferProxy from "../../../contracts/json/TransferProxy.json";
import TokenContract from "../../../contracts/json/ERC20token.json";

const PlaceBidModal = ({ show, handleModal, product }) => {
    const { walletData, setWalletData } = useContext(WalletData);

    const router = useRouter();

    async function switchNetwork(chainId) {
        if (
            parseInt(window.ethereum.networkVersion, 2) === parseInt(chainId, 2)
        ) {
            console.log(`Network is already with chain id ${chainId}`);
            return true;
        }
        try {
            const res = await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId }],
            });
            // console.log(res);
            return true;
        } catch (switchError) {
            // console.log(switchError);
            toast.error("Failed to change the network.");
        }
        return false;
    }

    async function completeAuction() {
        // update collectible putOnSale, saleType to true
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/${product.id}`,
            {
                data: {
                    putOnSale: false,
                    owner: walletData.account,
                },
            }
        );
        console.log(response);
    }

    async function StoreData(price) {
        try {
            const signer = walletData.provider.getSigner();
            if (product.collection.data.collectionType === "Single") {
                const { contractAddress } = product.collection.data;
                // Pull the deployed contract instance
                const tokenContract = new walletData.ethers.Contract(
                    TokenContract.address,
                    TokenContract.abi,
                    signer
                );

                const allowance = await tokenContract.allowance(
                    walletData.account,
                    TransferProxy.address
                );
                const allowanceAmount = parseInt(allowance._hex, 16);
                console.log(allowanceAmount, parseInt(price));
                if (allowanceAmount < parseInt(price)) {
                    // approve nft first
                    const transaction = await tokenContract.approve(
                        TransferProxy.address,
                        parseInt(price)
                    );
                    const receipt = await transaction.wait();
                    console.log(receipt);
                }
                if (product.auction.data.sellType == "FixedPrice") {
                    const seller = product.auction.data.walletAddress;
                    const buyer = walletData.account;
                    const erc20Address = TokenContract.address;
                    const nftAddress = contractAddress;
                    const nftType =
                        product.collection.data.collectionType === "Single"
                            ? 1
                            : 0;
                    const unitPrice = "1";
                    const skipRoyalty = true;
                    const amount = `${price}`;
                    const tokenId = `${product.nftID}`;
                    const tokenURI = "";
                    const supply = `${1}`;
                    const royaltyFee = `${10}`;
                    const qty = `${1}`;

                    // Pull the deployed contract instance
                    const tradeContract = new walletData.ethers.Contract(
                        TradeContract.address,
                        TradeContract.abi,
                        signer
                    );

                    console.log("Calling direct buy");
                    const transaction = await tradeContract.buyAsset([
                        seller,
                        buyer,
                        erc20Address,
                        nftAddress,
                        nftType,
                        unitPrice,
                        skipRoyalty,
                        amount,
                        tokenId,
                        tokenURI,
                        supply,
                        royaltyFee,
                        qty,
                    ]);
                    const receipt = await transaction.wait();
                    console.log(receipt);
                    if (receipt) {
                        completeAuction();
                    }
                }
            } else if (product.collection.data.collectionType === "Multiple") {
                const contractAddress =
                    product.collection.data.contractAddress1155;
            }

            // create bidding
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/biddings`,
                {
                    data: {
                        bidPrice: price,
                        bidderAddress: walletData.account,
                        timeStamp: new Date(),
                        auction: product.auction.data.id,
                    },
                }
            );
            // console.log(res);
            if (product.auction.data.sellType === "FixedPrice") {
                toast.success("NFT purchased successfully!");
            } else {
                toast.success("Bidding placed successfully!");
            }
            router.reload();
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!walletData.isConnected) {
            toast.error("Please connect wallet first");
            return;
        } // chnage network
        if (product.collection.data.networkType === "Ethereum") {
            if (!switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
                // ethereum testnet
                return;
            }
        } else if (product.collection.data.networkType === "Polygon") {
            if (!switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
                // polygon testnet
                return;
            }
        }
        StoreData(event.target.price.value);
    };

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
                            <Button
                                color="primary-alta"
                                size="medium"
                                className="mt--10"
                                onClick={handleModal}
                            >
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
    handleModal: PropTypes.func.isRequired,
};
export default PlaceBidModal;

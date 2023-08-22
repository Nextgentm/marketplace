import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { useContext, useEffect, useState } from "react";
import { AppData } from "src/context/app-context";
import strapi from "@utils/strapi";
import Product from "@components/product/layout-03";
import Pagination from "@components/pagination-02";
import { Spinner } from "react-bootstrap";
import { getERC1155Contract, getERC721Contract, getStakingNFTContract, switchNetwork } from "src/lib/BlokchainHelperFunctions";
import { toast } from "react-toastify";
import { BINANCE_NETWORK_CHAIN_ID, ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";

const SelectProducts = ({ show, handleModal, refreshPageData,
    loading, setLoading }) => {
    const { userData: authorData } = useContext(AppData);
    const { walletData, setWalletData } = useContext(AppData);
    const [loadingSpinner, setLoadingSpinner] = useState(false);

    // all own collectibles
    const [ownedData, setOwnedData] = useState([]);
    const [ownedDatapagination, setOwnedDataPagination] = useState({
        page: 1,
        pageCount: 1,
        pageSize: 4,
        total: 0
    });
    // hook to hold selected data for staking
    const [selectedItem, setSelectedItem] = useState(null);

    // function to update Selected obj
    const updateSelectedItems = async (obj, totalCount) => {
        if (selectedItem?.id == obj.id) {
            setSelectedItem(null);
        } else {
            obj.stakingAmount = totalCount;
            setSelectedItem(obj);
        }
        console.log(obj, totalCount);
    };

    useEffect(() => {
        if (authorData) {
            if (walletData.isConnected) {
                if (walletData.account) {
                    getOwnedDatapaginationRecord(1);
                } else {
                    setOwnedData([]);
                }
            } else {
                setOwnedData([]);
            }
        }
    }, [walletData]);

    const getOwnedDatapaginationRecord = async (page) => {
        let response = await strapi.find("collectibles", {
            filters: {
                $or: [{
                    $and: [{
                        owner: {
                            $eq: walletData.account
                        },
                    }, {
                        collection: {
                            collectionType: {
                                $eq: "Single"
                            }
                        },
                    }]
                }, {
                    $and: [{
                        owner_histories: {
                            toWalletAddress: {
                                $eq: walletData.account
                            }
                        },
                    }, {
                        collection: {
                            collectionType: {
                                $ne: "Single"
                            }
                        },
                    }]
                }]
            },
            populate: {
                collection: {
                    fields: "*",
                },
                collectible_stakings: {
                    fields: "*",
                    filters: {
                        isClaimed: false,
                    }
                },
            },
            pagination: {
                page,
                pageSize: ownedDatapagination.pageSize
            },
            sort: ["id:desc"]
        });
        // console.log(response);
        setOwnedDataPagination(response.meta.pagination);
        setOwnedData([...ownedData, ...response.data]);
    };

    const stakeSelectedNFT = async () => {
        setLoading(true);
        try {
            let product = selectedItem;
            if (!walletData.isConnected) {
                toast.error("Please connect wallet first");
                setLoading(false);
                return;
            } // chnage network
            if (product.collection.data.networkType === "Ethereum") {
                if (!await switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
                    // ethereum testnet
                    setLoading(false);
                    return;
                }
            } else if (product.collection.data.networkType === "Polygon") {
                if (!await switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
                    // polygon testnet
                    setLoading(false);
                    return;
                }
            } else if (product.collection.data.networkType === "Binance") {
                if (!await switchNetwork(BINANCE_NETWORK_CHAIN_ID)) {
                    // polygon testnet
                    setLoading(false);
                    return;
                }
            }

            let index = null;
            // Pull the deployed contract instance
            const stakingNFT = await getStakingNFTContract(walletData);
            const stakeDuration = await stakingNFT.rewardRateDuration();
            if (product.collection.data.collectionType === "Single") {
                const contractAddress = product.collection.data.contractAddress;
                // console.log(contractAddress);
                // Pull the deployed contract instance
                const contract721 = await getERC721Contract(walletData, contractAddress);
                let approveAddress = await contract721.getApproved(product.nftID);
                // approve nft first
                if (approveAddress.toLowerCase() != walletData.contractData.StakingContract.address.toLowerCase()) {
                    // approve nft first
                    const transaction = await contract721.approve(walletData.contractData.StakingContract.address, product.nftID);
                    const receipt = await transaction.wait();
                    // console.log(receipt);
                }

                const transaction = await stakingNFT.stakeToken(contractAddress, product.nftID, 1, 1);
                const receipt = await transaction.wait();
                console.log(receipt);
                const correctEvent = receipt.events.find((event) => event.event === "TokensStaked");
                // console.log("correctEvent is ", correctEvent);
                index = parseInt(correctEvent.args.index._hex, 16);
                // console.log("index is ", index);
            } else if (product.collection.data.collectionType === "Multiple") {
                const contractAddress = product.collection.data.contractAddress1155;
                // Pull the deployed contract instance
                const contract1155 = await getERC1155Contract(walletData, contractAddress);

                const approved = await contract1155.isApprovedForAll(walletData.account, walletData.contractData.StakingContract.address);
                // console.log(approved);
                if (!approved) {
                    const transaction = await contract1155.setApprovalForAll(walletData.contractData.StakingContract.address, true);
                    const receipt = await transaction.wait();
                }

                const transaction = await stakingNFT.stakeToken(contractAddress, product.nftID, product.stakedAmount, 0);
                const receipt = await transaction.wait();

                const correctEvent = receipt.events.find((event) => event.event === "TokensStaked");
                console.log("correctEvent is ", correctEvent);
                index = parseInt(correctEvent.args.index._hex, 16);
                console.log("index is ", index);
            }

            // create staking data
            const res = await strapi.create("collectible-stakings", {
                walletAddress: walletData.account,
                collectible: product.id,
                stakingAmount: product.stakedAmount,
                stakingStartTime: new Date(),
                stakingEndTime: new Date(new Date().getTime() + 1000 * stakeDuration),
                rewardAmount: 0,
                restakingCount: 0,
                rewardType: "Crypto",
                isClaimed: false,
                index: index
            });
            console.log(res);

            await refreshPageData();
            handleModal();
            toast.success("Stake successfully!");
            setLoading(false);
        } catch (error) {
            console.log(error);
            toast.error("Error while staking");
            setLoading(false);
        }
        setLoading(false);
    }

    return (
        <Modal className="rn-popup-modal select-staking-modal-wrapper select-collectible-modal-wrapper" show={show} onHide={handleModal} size="xl" centered>
            {show && (
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header>
                <h3 className="modal-title">Select collectible</h3>
            </Modal.Header>
            <Modal.Body>
                <hr />
                <div className="row">
                    <div className="col-md-12 mb-2">
                        <p>Select collectible to stake</p>
                    </div>
                    <div className="col-md-4">
                        <Button color="primary-alta" size="medium" className="mr--10 w-100" onClick={handleModal} disabled={loading}>
                            Cancel
                        </Button>
                    </div>
                    <div className="col-md-4"> </div>

                    <div className="col-md-4">
                        <Button size="medium" className="mr--10 w-100" onClick={() => stakeSelectedNFT()} disabled={loading}>
                            Confirm
                        </Button>
                    </div>
                </div>
                <hr />
                <div className="row g-4 d-flex">
                    {ownedData?.map(
                        (prod, index) =>
                            (prod.collectible_stakings == null || prod.collectible_stakings?.data[0]?.isClaimed == true) && (
                                <div key={index} className="col-3 col-lg-3 col-md-6 col-sm-6 col-12">
                                    <Product
                                        title={prod.name}
                                        supply={prod.supply}
                                        image={prod.image?.data ? prod.image?.data?.url : prod.image_url}
                                        collectionName={prod.collection?.data?.name}
                                        network={prod.collection?.data?.networkType}
                                        contractAddress={prod.collection?.data?.collectionType === "Single" ?
                                            null : prod.collection?.data?.contractAddress1155}
                                        nftID={prod.nftID}
                                        multiselection={true}
                                        isSelected={selectedItem?.id == prod.id}
                                        updateSelected={(totalCount) => updateSelectedItems(prod, totalCount)}
                                    />
                                </div>
                            )
                    )}
                    {loadingSpinner &&
                        <div className="row spinner-container">
                            <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem" }}>
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    }
                    {ownedDatapagination?.pageCount > 1 && ownedDatapagination.page < ownedDatapagination?.pageCount ? (
                        <div className="row page-load-more mb-5">
                            <Button onClick={() => getOwnedDatapaginationRecord(ownedDatapagination.page + 1)} disabled={loading}>
                                ...Load More
                            </Button>
                        </div>
                    ) : null}
                </div>
            </Modal.Body>
        </Modal >
    );
};

SelectProducts.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired
};
export default SelectProducts;

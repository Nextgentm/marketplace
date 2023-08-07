import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { useContext, useEffect, useState } from "react";
import { AppData } from "src/context/app-context";
import strapi from "@utils/strapi";
import Product from "@components/product/layout-03";
import Pagination from "@components/pagination-02";
import { Spinner } from "react-bootstrap";
import { getERC1155Contract, getERC721Contract, getStakingNFTContract } from "src/lib/BlokchainHelperFunctions";
import { toast } from "react-toastify";

const SelectProducts = ({ show, handleModal, refreshPageData }) => {
    const { userData: authorData } = useContext(AppData);
    const { walletData, setWalletData } = useContext(AppData);
    const [loading, setLoading] = useState(false);

    // all own collectibles
    const [ownedData, setOwnedData] = useState([]);
    const [ownedDatapagination, setOwnedDataPagination] = useState({
        page: 1,
        pageCount: 1,
        pageSize: 12,
        total: 0
    });
    // hook to hold selected data for staking
    const [allSelectedItems, setAllSelectedItems] = useState([]);

    const isExist = (id) => {
        let doesExist = allSelectedItems.some(function (ele) {
            return ele.id === id;
        });
        return doesExist;
    }

    // function to update Selected obj
    const updateSelectedItems = async (obj, totalCount) => {
        if (isExist(obj.id)) {
            const arr = allSelectedItems.filter(item => item.id !== obj.id)
            setAllSelectedItems(arr);
        } else {
            obj.stakingAmount = totalCount;
            setAllSelectedItems([...allSelectedItems, obj]);
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
            populate: "*",
            pagination: {
                page,
                pageSize: ownedDatapagination.pageSize
            },
        });
        // console.log(response);
        setOwnedDataPagination(response.meta.pagination);
        setOwnedData([...ownedData, ...response.data]);
    };

    const stakeAllSelectedNFT = async () => {
        try {
            // chnage network
            // if (network === "Ethereum") {
            //   if (!await switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
            //     // ethereum testnet
            //     return;
            //   }
            // } else if (network === "Polygon") {
            //   if (!await switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
            //     // polygon testnet
            //     return;
            //   }
            // } else if (network === "Binance") {
            //   if (!await switchNetwork(BINANCE_NETWORK_CHAIN_ID)) {
            //     // polygon testnet
            //     return;
            //   }
            // }
            // create data for it
            let NFTContractAddresses = [],
                tokenTypes = [],
                tokenIds = [],
                stakedAmounts = [];
            let selectedNetworks = [];

            let _allSelectedItems = allSelectedItems;
            try {
                for (let i = 0; i < _allSelectedItems.length; i++) {
                    const item = _allSelectedItems[i];
                    //NFTContractAddresses
                    const contractAddress = item.collection?.data?.collectionType === "Single" ?
                        item.collection?.data?.contractAddress
                        : item.collection?.data?.contractAddress1155;
                    NFTContractAddresses.push(contractAddress);
                    //tokenTypes
                    const tokenType = item.collection?.data?.collectionType === "Single" ? 1 : 0;
                    tokenTypes.push(tokenType);
                    //tokenIds
                    const tokenId = item.nftID;
                    tokenIds.push(tokenId);
                    //stakedAmount
                    const stakedAmount = item.supply;//stakingAmount
                    stakedAmounts.push(stakedAmount);
                    //network
                    if (!selectedNetworks.includes(item.collection?.data?.networkType)) {
                        selectedNetworks.push(item.collection?.data?.networkType);
                    }
                    //Approve all selected NFT
                    if (item.collection?.data?.collectionType === "Single") {
                        // Pull the deployed contract instance
                        const contract721 = await getERC721Contract(walletData, contractAddress);
                        let approveAddress = await contract721.getApproved(item.nftID);
                        // approve nft first
                        if (approveAddress.toLowerCase() != walletData.contractData.StakingContract.address.toLowerCase()) {
                            // approve nft first
                            const transaction = await contract721.setApprovalForAll(walletData.contractData.StakingContract.address, true);
                            const receipt = await transaction.wait();
                            // console.log(receipt);
                        }
                    } else if (item.collection?.data?.collectionType === "Multiple") {
                        // Pull the deployed contract instance
                        const contract1155 = await getERC1155Contract(walletData, contractAddress);

                        const approved = await contract1155.isApprovedForAll(walletData.account, walletData.contractData.StakingContract.address);
                        // console.log(approved);
                        if (!approved) {
                            const transaction = await contract1155.setApprovalForAll(walletData.contractData.StakingContract.address, true);
                            const receipt = await transaction.wait();
                        }
                    }
                }
            } catch (error) {
                toast.error("Error while approving selected NFT");
                console.log(error);
                return;
            }

            if (selectedNetworks.length > 1) {
                toast.error("Can't unstake Collectible with multiple Networks");
                return;
            }
            console.log(NFTContractAddresses);
            console.log(tokenTypes);
            console.log(tokenIds);
            console.log(stakedAmounts);

            const stakingNFT = await getStakingNFTContract(walletData);
            const stakeDuration = await stakingNFT.rewardRateDuration();
            const transaction = await stakingNFT.stakeTokenBatch(NFTContractAddresses, tokenTypes, tokenIds, stakedAmounts);
            const receipt = await transaction.wait();
            console.log(receipt);

            let stakingIndexs = [];
            //get all correct Events
            const correctEvents = receipt.events.filter((event) => event.event === "TokensStaked");
            // console.log("correctEvents are ", correctEvents);
            for (let i = 0; i < correctEvents.length; i++) {
                const correctEvent = correctEvents[i];
                const index = parseInt(correctEvent.args.index._hex, 16);
                // console.log("index is ", i, index);
                stakingIndexs.push(index);
            }
            console.log(stakingIndexs);
            _allSelectedItems.map(async (item, i) => {
                // create staking data
                const res = await strapi.create("collectible-stakings", {
                    walletAddress: walletData.account,
                    collectible: item.id,
                    stakingAmount: stakedAmounts[i],
                    stakingStartTime: new Date(),
                    stakingEndTime: new Date(new Date().getTime() + 1000 * stakeDuration),
                    rewardAmount: 0,
                    restakingCount: 0,
                    rewardType: "Crypto",
                    isClaimed: false,
                    index: stakingIndexs[i]
                });
                console.log(res);
            })

            await refreshPageData();
            handleModal();
            toast.success("all stake successfully!");
        } catch (error) {
            console.log(error);
            toast.error("Error while staking");
        }
    }

    return (
        <Modal className="rn-popup-modal select-staking-modal-wrapper select-collectible-modal-wrapper" show={show} onHide={handleModal} size="xl" centered>
            {show && (
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header>
                <h3 className="modal-title">Select NFT</h3>
            </Modal.Header>
            <Modal.Body>
                <hr />
                <div className="row g-4 d-flex">
                    {ownedData?.map(
                        (prod, index) => (
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
                                    isSelected={isExist(prod.id)}
                                    updateSelected={(totalCount) => updateSelectedItems(prod, totalCount)}
                                />
                            </div>
                        )
                    )}
                    {loading &&
                        <div className="row spinner-container">
                            <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem" }}>
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    }
                    {ownedDatapagination?.pageCount > 1 && ownedDatapagination.page < ownedDatapagination?.pageCount ? (
                        <div className="row page-load-more mb-5">
                            <Button onClick={() => getOwnedDatapaginationRecord(ownedDatapagination.page + 1)}>
                                ...Load More
                            </Button>
                        </div>
                    ) : null}
                </div>
                <hr />
                <div className="row">
                    <div className="col-md-4">
                        <Button color="primary-alta" size="medium" className="mr--10 w-100" onClick={handleModal}>
                            Cancel
                        </Button>
                    </div>

                    <div className="col-md-4">
                        <span>{allSelectedItems.length} items selected</span>
                    </div>

                    <div className="col-md-4">
                        <Button size="medium" className="mr--10 w-100" onClick={() => stakeAllSelectedNFT()}>
                            confirm
                        </Button>
                    </div>
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

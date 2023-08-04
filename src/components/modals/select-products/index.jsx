import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { useContext, useEffect, useState } from "react";
import { AppData } from "src/context/app-context";
import strapi from "@utils/strapi";
import Product from "@components/product/layout-03";
import Pagination from "@components/pagination";

const SelectProducts = ({ show, handleModal, handleSubmit }) => {
    const { userData: authorData } = useContext(AppData);
    const { walletData, setWalletData } = useContext(AppData);

    // all own collectibles
    const [ownedData, setOwnedData] = useState([]);
    const [ownedDatapagination, setOwnedDataPagination] = useState({
        page: 1,
        pageCount: 1,
        pageSize: 10,
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
    const updateSelectedItems = async (obj) => {
        if (isExist(obj.id)) {
            const arr = allSelectedItems.filter(item => item.id !== obj.id)
            setAllSelectedItems(arr);
        } else {
            setAllSelectedItems([...allSelectedItems, obj]);
        }
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
                            $eq: "0x47af5440658eb8cb28a8fef88d18e10b7f48d38b"//walletData.account
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
        setOwnedData(response.data);
    };

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
                <div className="col-md-4">
                    <span>{allSelectedItems.length} items selected</span>
                </div>
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
                                    multiselection={true}
                                    isSelected={isExist(prod.id)}
                                    updateSelected={() => updateSelectedItems(prod)}
                                />
                            </div>
                        )
                    )}
                    {/* {ownedDatapagination?.pageCount > 1 ? (
                        <Pagination
                            className="single-column-blog"
                            currentPage={ownedDatapagination.page}
                            numberOfPages={ownedDatapagination.pageCount}
                            onClick={getOwnedDatapaginationRecord}
                        />
                    ) : null} */}
                </div>
                <hr />
                <div className="row">
                    <div className="col-md-4">
                        <Button color="primary-alta" size="medium" className="mr--10 w-100" onClick={handleModal}>
                            Cancel
                        </Button>
                    </div>

                    <div className="col-md-4">
                        <Button size="medium" className="mr--10 w-100">
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

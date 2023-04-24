/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import Button from "@ui/button";
import ProductModal from "@components/modals/product-modal";
import ErrorText from "@ui/error-text";
import { toast } from "react-toastify";
import axios from "axios";
import NiceSelect from "@ui/nice-select";
// import CreateNFT from "src/CollectionNFT";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/router";
import { WalletData } from "src/context/wallet-context";
import {
    ETHEREUM_NETWORK_CHAIN_ID,
    POLYGON_NETWORK_CHAIN_ID,
} from "src/lib/constants";
import ERC721Contract from "../../contracts/json/erc721.json";
import ERC1155Contract from "../../contracts/json/erc1155.json";

const CreateNewArea = ({ className, space }) => {
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState();
    const [hasImageError, setHasImageError] = useState(false);
    const [previewData, setPreviewData] = useState({});
    const [dataCollection, setDataCollection] = useState(null);

    const { walletData, setWalletData } = useContext(WalletData);

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        getValues,
        watch,
    } = useForm({
        mode: "onChange",
    });

    watch(["file"]);

    const notify = () => toast("Your product has submitted");
    const handleProductModal = () => {
        setShowProductModal(false);
    };
    const [selectedCollection, setSelectedCollection] = useState(null);

    const [nftImagePath, setNftImagePath] = useState("");
    const [nftImageId, setNftImageId] = useState("");

    const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);

    const isAddPropertyModalHandler = () =>
        setIsAddPropertyModalOpen((prev) => !prev);

    const selectedCollectionHandler = (item) => {
        setSelectedCollection(item.value);
    };

    /** Dynamic_fields */
    const [formValues, setFormValues] = useState([
        // { properties_name: "", properties_type: "" },
    ]);

    /** Dynamic_fields */

    // This function will be triggered when the file field change
    /* const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        }
    }; */

    const addPropertyPopup = (e) => {
        setIsAddPropertyModalOpen(true);
    };

    async function updateImage(e) {
        // console.log(getValues(e));
        if (getValues(e) && getValues(e)?.length > 0) {
            setSelectedImage(getValues(e)?.[0]);
        }

        if (nftImageId) {
            /** FOr Update Image */
            const formUpdateImage = new FormData();
            formUpdateImage.append("fileInfo", getValues(e)?.[0]);
            await fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload?id=${nftImageId}`,
                {
                    method: "post",
                    body: formUpdateImage,
                }
            )
                .then((response) => response.json())
                .then((res) => {
                    setNftImagePath(JSON.stringify(res));
                    setNftImageId(res?.id);
                });
        } else {
            const formData = new FormData();
            formData.append("files", getValues(e)?.[0]);
            await fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`,
                {
                    method: "post",
                    body: formData,
                }
            )
                .then((response) => response.json())
                .then((res) => {
                    setNftImagePath(JSON.stringify(res[0]));
                    setNftImageId(res[0]?.id);
                });
        }
    }

    async function StoreData(data) {
        try {
            let contractAddress;
            if (router.query.type === "single") {
                contractAddress = selectedCollection.contractAddress;
            } else if (router.query.type === "multiple") {
                contractAddress = selectedCollection.contractAddress1155;
            }
            const metadataURL = data?.external_url ? data?.external_url : "";
            const { price, royality } = data;
            const supply = data?.supply ? Number(data?.supply) : 1;

            const tokenID = await MintNFT(
                contractAddress,
                metadataURL,
                price,
                royality,
                supply
            );
            if (!tokenID) {
                return;
            }

            const nft_url_4 = JSON.parse(nftImagePath);
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles`,
                {
                    data: {
                        name: data.name ? data.name : null,
                        image: nft_url_4 || "ImagePath",
                        imageID: nftImageId || 0,
                        description: data.discription ? data.discription : null,
                        price: data.price ? Number(data.price) : null,
                        size: 1, // data.size ? Number(data.size) : null,
                        symbol: "wETH",
                        nftID: tokenID.toString(),
                        external_url: data?.external_url,
                        properties: formValues || null,
                        royalty: data.royality ? Number(data.royality) : null,
                        supply,
                        imageHash: "String",
                        metadataHash: "String",
                        creator: walletData.account,
                        owner: walletData.account,
                        collectionContractAddress:
                            data.collectionContractAddress
                                ? data.collectionContractAddress
                                : null,
                        putOnSale: false, // data.putonsale,
                        instantSalePrice: data.instantsaleprice,
                        unlockPurchased: data.unlockpurchased,
                        slug: data.name
                            ? data.name.toLowerCase().split(" ").join("-")
                            : null,
                        collection: selectedCollection.id,
                    },
                }
            );
            console.log(res);
            const collectiblesId = res.data.data.id;
            // Add collectible properties
            for (let i = 0; i < formValues.length; i++) {
                if (
                    formValues[i].properties_name &&
                    formValues[i].properties_type
                ) {
                    axios.post(
                        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectible-properties`,
                        {
                            data: {
                                name: formValues[i].properties_name,
                                type: formValues[i].properties_type,
                                collectibles: collectiblesId,
                            },
                        }
                    );
                }
            }
            notify();
            reset();
            setSelectedImage();
            setFormValues([]);
        } catch (error) {
            console.log(error);
        }
    }

    async function MintNFT(
        contractAddress,
        metadataURL,
        price,
        royalty,
        supply
    ) {
        const signer = walletData.provider.getSigner();

        try {
            // deployed contract instance
            // console.log(router.query.type); // type of NFT collection
            // const contractAddress =
            //     "0xe168a8806ac3d151A46c7a3853e8226076FF286c";
            // const metadataURL = "";
            // const price = 100;
            // const royalty = 20;
            // const supply = 100;
            console.log(contractAddress, metadataURL, price, royalty, supply);
            if (router.query.type === "single") {
                // Pull the deployed contract instance
                const contract721 = new walletData.ethers.Contract(
                    contractAddress,
                    ERC721Contract.abi,
                    signer
                );
                const options = {
                    value: walletData.ethers.utils.parseEther("0.01"),
                };
                const transaction = await contract721.createToken(
                    metadataURL,
                    price
                    // options
                );
                const receipt = await transaction.wait();
                // console.log(receipt);
                const correctEvent = receipt.events.find(
                    (event) => event.event === "Transfer"
                );
                const tokenID = parseInt(correctEvent.args.tokenId._hex, 16);
                console.log("tokenID is ", tokenID);
                return tokenID;
            }
            if (router.query.type === "multiple") {
                // Pull the deployed contract instance
                const contract1155 = new walletData.ethers.Contract(
                    contractAddress,
                    ERC1155Contract.abi,
                    signer
                );
                const transaction = await contract1155.mint(
                    metadataURL,
                    royalty,
                    supply
                );
                const receipt = await transaction.wait();
                // console.log(receipt);
                const correctEvent = receipt.events.find(
                    (event) => event.event === "TransferSingle"
                );
                const tokenID = parseInt(correctEvent.args.id._hex, 16);
                console.log("tokenID is ", tokenID);
                return tokenID;
            }
            toast.error("Please select proper collection type");
            return null;
        } catch (error) {
            console.log(error);
            toast.error("Error while creating NFT");
            return null;
        }
    }

    const onSubmit = (data, e) => {
        const { target } = e;
        const submitBtn =
            target.localName === "span" ? target.parentElement : target;
        const isPreviewBtn = submitBtn.dataset?.btn;
        setHasImageError(!selectedImage);

        if (!walletData.isConnected) {
            toast.error("Please connect wallet first");
            return;
        } // chnage network
        if (selectedCollection.networkType === "Ethereum") {
            if (!switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
                // ethereum testnet
                return;
            }
        } else if (selectedCollection.networkType === "Polygon") {
            if (!switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
                // polygon testnet
                return;
            }
        }
        if (isPreviewBtn && selectedImage) {
            setPreviewData({ ...data, image: selectedImage });
            setShowProductModal(true);
        }
        if (!isPreviewBtn) {
            StoreData(data);
        }
    };

    const ShareModal = ({ show, handleModal, formValues, setFormValues }) => {
        // Inner values used to stop multiple rendering of popup view
        const [formDataValues, setFormDataValues] = useState([]);

        useEffect(() => {
            setFormDataValues(formValues);
        }, []);

        const onSave = () => {
            setFormValues(formDataValues);
            handleModal();
        };

        const addFormFields = () => {
            // console.log(formDataValues);
            setFormDataValues([
                ...formDataValues,
                { properties_name: "", properties_type: "" },
            ]);
        };

        const handleNameChange = (i, e) => {
            const newFormValues = [...formDataValues];
            newFormValues[i].properties_name = e.target.value;
            setFormDataValues(newFormValues);
        };
        const handleChange = (i, e) => {
            const newFormValues = [...formDataValues];
            newFormValues[i].properties_type = e.target.value;
            setFormDataValues(newFormValues);
        };

        const removeFormFields = (i) => {
            const newFormValues = [...formDataValues];
            newFormValues.splice(i, 1);
            setFormDataValues(newFormValues);
        };

        return (
            <Modal
                className="rn-popup-modal share-modal-wrapper"
                show={show}
                onHide={handleModal}
                centered
                dialogClassName="modal-800px"
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
                <Modal.Body>
                    <h5>Add Properties</h5>
                    <form action="#">
                        <div className="form-wrapper-one">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="input-box pb--20">
                                        <label
                                            htmlFor="name"
                                            className="form-label"
                                        >
                                            Name
                                        </label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="input-box pb--20">
                                        <label
                                            htmlFor="type"
                                            className="form-label"
                                        >
                                            Type
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {formDataValues?.map((element, index) => (
                                <div className="row">
                                    <div className="col-md-5">
                                        <div className="input-box pb--20">
                                            <input
                                                id={`properties_name${index}`}
                                                placeholder="Name"
                                                value={element.properties_name}
                                                {...register(
                                                    `properties_name${index}`,
                                                    {
                                                        onChange: (e) => {
                                                            handleNameChange(
                                                                index,
                                                                e
                                                            );
                                                        },
                                                        required:
                                                            "Enter properties name",
                                                    }
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="input-box pb--20">
                                            <input
                                                id={`properties_type${index}`}
                                                placeholder="Type"
                                                value={element.properties_type}
                                                {...register(
                                                    `properties_type${index}`,
                                                    {
                                                        onChange: (e) => {
                                                            handleChange(
                                                                index,
                                                                e
                                                            );
                                                        },
                                                        required:
                                                            "Enter properties type",
                                                    }
                                                )}
                                            />
                                        </div>
                                    </div>
                                    {index ? (
                                        <div className="col-md-2 col-xl-2">
                                            <div className="input-box">
                                                <Button
                                                    color="primary-alta"
                                                    fullwidth
                                                    type="button"
                                                    data-btn="preview"
                                                    onClick={() =>
                                                        removeFormFields(index)
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                            <div className="row">
                                <div className="col-md-12 col-xl-3">
                                    <div className="input-box">
                                        <Button
                                            color="primary-alta"
                                            fullwidth
                                            type="button"
                                            data-btn="preview"
                                            onClick={addFormFields}
                                        >
                                            Add More
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-md-12 col-xl-1">
                                    <div className="input-box">
                                        <Button
                                            color="primary"
                                            fullwidth
                                            type="button"
                                            aria-label="Close"
                                            onClick={onSave}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };

    useEffect(() => {
        axios
            .get(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections?populate=*`
            )
            .then((response) => {
                // setDataCollection(response.data.data);
                const results = [];
                response.data.data.map((data) =>
                    results.push({
                        value: data,
                        text: data.name,
                    })
                );
                setDataCollection(results);
            });
    }, [router.query.type]);
    // console.log(dataCollection);

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

    useEffect(() => {
        if (selectedCollection) {
            if (selectedCollection.networkType === "Ethereum") {
                switchNetwork(ETHEREUM_NETWORK_CHAIN_ID); // ethereum testnet
            } else if (selectedCollection.networkType === "Polygon") {
                switchNetwork(POLYGON_NETWORK_CHAIN_ID); // polygon testnet
            }
        }
    }, [selectedCollection]);

    return (
        <>
            <div
                className={clsx(
                    "create-area",
                    space === 1 && "rn-section-gapTop",
                    className
                )}
            >
                <ShareModal
                    show={isAddPropertyModalOpen}
                    handleModal={isAddPropertyModalHandler}
                    formValues={formValues}
                    setFormValues={setFormValues}
                />
                <form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <div className="container">
                        <div className="row g-5">
                            <div className="col-lg-3 offset-1 ml_md--0 ml_sm--0">
                                <div className="upload-area">
                                    <div className="upload-formate mb--30">
                                        <h6 className="title">Upload file</h6>
                                        <p className="formate">
                                            Drag or choose your file to upload
                                        </p>
                                    </div>

                                    <div className="brows-file-wrapper">
                                        <input
                                            name="file"
                                            id="file"
                                            type="file"
                                            className="inputfile"
                                            data-multiple-caption="{count} files selected"
                                            multiple
                                            {...register("file", {
                                                required: "Upload logo image",
                                                onChange: () => {
                                                    updateImage("file");
                                                },
                                            })}
                                        />
                                        {selectedImage && (
                                            <img
                                                id="createfileImage"
                                                src={URL.createObjectURL(
                                                    selectedImage
                                                )}
                                                alt=""
                                                data-black-overlay="6"
                                            />
                                        )}

                                        <label
                                            htmlFor="file"
                                            title="No File Choosen"
                                        >
                                            <i className="feather-upload" />
                                            <span className="text-center">
                                                Choose a File
                                            </span>
                                            <p className="text-center mt--10">
                                                PNG, GIF, WEBP, MP4 or MP3.{" "}
                                                <br /> Max 1Gb.
                                            </p>
                                        </label>
                                    </div>
                                    {hasImageError && !selectedImage && (
                                        <ErrorText>Image is required</ErrorText>
                                    )}
                                </div>

                                <div className="mt--100 mt_sm--30 mt_md--30 d-none d-lg-block">
                                    {router.query?.type && (
                                        <h5>
                                            Selected Variants:{" "}
                                            {router.query?.type.toUpperCase()}
                                        </h5>
                                    )}
                                    <h5> Note: </h5>
                                    <span>
                                        {" "}
                                        Service fee : <strong>2.5%</strong>{" "}
                                    </span>{" "}
                                    <br />
                                    <span>
                                        {" "}
                                        You will receive :{" "}
                                        <strong>25.00 ETH $50,000</strong>
                                    </span>
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <div className="form-wrapper-one">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="name"
                                                    className="form-label"
                                                >
                                                    Product Name
                                                </label>
                                                <input
                                                    id="name"
                                                    placeholder="e. g. `Digital Awesome Game`"
                                                    {...register("name", {
                                                        required:
                                                            "Name is required",
                                                    })}
                                                />
                                                {errors.name && (
                                                    <ErrorText>
                                                        {errors.name?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                        {router.query?.type && (
                                            <div className="col-md-6">
                                                <div className="input-box pb--20">
                                                    <label
                                                        htmlFor="type"
                                                        className="form-label"
                                                    >
                                                        Type
                                                    </label>
                                                    <input
                                                        id="type"
                                                        placeholder="Type"
                                                        value={router.query?.type.toUpperCase()}
                                                        readOnly
                                                        {...register("type")}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Discription"
                                                    className="form-label"
                                                >
                                                    Discription
                                                </label>
                                                <textarea
                                                    id="discription"
                                                    rows="3"
                                                    placeholder="e. g. “After purchasing the product you can get item...”"
                                                    {...register(
                                                        "discription",
                                                        {
                                                            required:
                                                                "Discription is required",
                                                        }
                                                    )}
                                                />
                                                {errors.discription && (
                                                    <ErrorText>
                                                        {
                                                            errors.discription
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="collection-single-wized">
                                                <label
                                                    htmlFor="category"
                                                    className="title required"
                                                >
                                                    Collection
                                                </label>
                                                <div className="create-collection-input">
                                                    {dataCollection && (
                                                        <NiceSelect
                                                            name="category"
                                                            placeholder="Select Collection"
                                                            options={
                                                                dataCollection
                                                            }
                                                            onChange={
                                                                selectedCollectionHandler
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Propertie"
                                                    className="form-label"
                                                >
                                                    Properties
                                                </label>
                                                <div className="input-box">
                                                    <Button
                                                        color="primary-alta"
                                                        onClick={
                                                            addPropertyPopup
                                                        }
                                                    >
                                                        Add Properties
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="price"
                                                    className="form-label"
                                                >
                                                    Item Price
                                                </label>
                                                <input
                                                    id="price"
                                                    placeholder="e. g. `20$`"
                                                    {...register("price", {
                                                        pattern: {
                                                            value: /^[0-9]+$/,
                                                            message:
                                                                "Please enter a number",
                                                        },
                                                        required:
                                                            "Price is required",
                                                    })}
                                                />
                                                {errors.price && (
                                                    <ErrorText>
                                                        {errors.price?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Royality"
                                                    className="form-label"
                                                >
                                                    Royality
                                                </label>
                                                <input
                                                    id="royality"
                                                    placeholder="e. g. `20%`"
                                                    {...register("royality", {
                                                        pattern: {
                                                            value: /^[0-9]+$/,
                                                            message:
                                                                "Please enter a number",
                                                        },
                                                        required:
                                                            "Royality is required",
                                                    })}
                                                />
                                                {errors.royality && (
                                                    <ErrorText>
                                                        {
                                                            errors.royality
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="External URL"
                                                    className="form-label"
                                                >
                                                    External URL
                                                </label>
                                                <input
                                                    id="external_url"
                                                    placeholder="External URL"
                                                    {...register("externalurl")}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            {router.query.type ===
                                                "multiple" && (
                                                    <div className="input-box pb--20">
                                                        <label
                                                            htmlFor="supply"
                                                            className="form-label"
                                                        >
                                                            Supply
                                                        </label>
                                                        <input
                                                            id="supply"
                                                            placeholder="e. g. `1-100`"
                                                            {...register("supply", {
                                                                pattern: {
                                                                    value: /^[0-9]+$/,
                                                                    message:
                                                                        "Please enter a number",
                                                                },
                                                            })}
                                                        />
                                                    </div>
                                                )}
                                        </div>

                                        {/* <div className="row">
                                            <div className="col-md-4 col-sm-4">
                                                <div className="input-box pb--20 rn-check-box">
                                                    <input
                                                        className="rn-check-box-input"
                                                        type="checkbox"
                                                        id="putonsale"
                                                        {...register(
                                                            "putonsale"
                                                        )}
                                                    />
                                                    <label
                                                        className="rn-check-box-label"
                                                        htmlFor="putonsale"
                                                    >
                                                        Put on Sale
                                                    </label>
                                                </div>
                                            </div>
                                        </div> */}
                                        {/*
                                        <div className="col-md-4 col-sm-4">
                                            <div className="input-box pb--20 rn-check-box">
                                                <input
                                                    className="rn-check-box-input"
                                                    type="checkbox"
                                                    id="instantsaleprice"
                                                    {...register(
                                                        "instantsaleprice"
                                                    )}
                                                />
                                                <label
                                                    className="rn-check-box-label"
                                                    htmlFor="instantsaleprice"
                                                >
                                                    Instant Sale Price
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-4">
                                            <div className="input-box pb--20 rn-check-box">
                                                <input
                                                    className="rn-check-box-input"
                                                    type="checkbox"
                                                    id="unlockpurchased"
                                                    {...register(
                                                        "unlockpurchased"
                                                    )}
                                                />
                                                <label
                                                    className="rn-check-box-label"
                                                    htmlFor="unlockpurchased"
                                                >
                                                    Unlock Purchased
                                                </label>
                                            </div>
                                        </div> */}

                                        <div className="col-md-12 col-xl-4">
                                            <div className="input-box">
                                                <Button
                                                    color="primary-alta"
                                                    fullwidth
                                                    type="submit"
                                                    data-btn="preview"
                                                    onClick={handleSubmit(
                                                        onSubmit
                                                    )}
                                                >
                                                    Preview
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="col-md-12 col-xl-8 mt_lg--15 mt_md--15 mt_sm--15">
                                            <div className="input-box">
                                                <Button type="submit" fullwidth>
                                                    Submit Item
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt--100 mt_sm--30 mt_md--30 d-block d-lg-none">
                                        <h5> Note: </h5>
                                        <span>
                                            {" "}
                                            Service fee : <strong>
                                                2.5%
                                            </strong>{" "}
                                        </span>{" "}
                                        <br />
                                        <span>
                                            {" "}
                                            You will receive :{" "}
                                            <strong>25.00 ETH $50,000</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {showProductModal && (
                <ProductModal
                    show={showProductModal}
                    handleModal={handleProductModal}
                    data={previewData}
                />
            )}
        </>
    );
};

CreateNewArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1]),
};

CreateNewArea.defaultProps = {
    space: 1,
};

export default CreateNewArea;

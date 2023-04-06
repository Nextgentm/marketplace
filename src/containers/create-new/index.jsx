/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
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
import { useRouter } from "next/router";

const CreateNewArea = ({ className, space }) => {
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState();
    const [hasImageError, setHasImageError] = useState(false);
    const [previewData, setPreviewData] = useState({});
    const [dataCollection, setDataCollection] = useState(null);

    const router = useRouter();
    const data = router.query;
    // console.log(data.type);
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
    const [category, setCategory] = useState("");
    const categoryHandler = (item) => {
        setCategory(item.value);
    };

    // This function will be triggered when the file field change
    const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        }
    };

    async function updateImage(e) {
        // console.log(getValues(e));
        if (getValues(e) && getValues(e)?.length > 0) {
            setSelectedImage(getValues(e)?.[0]);
        }
        const formData = new FormData();
        formData.append("files", getValues(e)?.[0]);
        const resp = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`,
            {
                method: "post",
                body: formData,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                if (data[0]?.id) {
                    const old_id = localStorage.getItem("nft_id_4");
                    if (old_id) {
                        fetch(
                            `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload/files/:${old_id}`,
                            {
                                method: "delete",
                            }
                        );
                    }
                    localStorage.setItem("nft_id_4", data[0]?.id);
                    localStorage.setItem("nft_url_4", JSON.stringify(data[0]));
                }
            })
            .catch(() => {
                // Promise Failed, Do something
            });
    }

    async function StoreData(data) {
        try {
            const nft_id_4 = localStorage.getItem("nft_id_4");
            const nft_url_4 = JSON.parse(localStorage.getItem("nft_url_4"));

            await axios.post(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles`,
                {
                    data: {
                        name: data.name ? data.name : null,
                        image: nft_url_4 || "ImagePath",
                        imageID: nft_id_4 || 0,
                        description: data.discription ? data.discription : null,
                        price: data.price ? Number(data.price) : null,
                        size: data.size ? Number(data.size) : null,
                        symbol: "wETH",
                        properties: data.propertiy ? data.propertiy : null,
                        royalty: data.royality ? Number(data.royality) : null,
                        numberOfCopies: data.numberOfCopies
                            ? Number(data.numberOfCopies)
                            : null,
                        imageHash: "String",
                        metadataHash: "String",
                        creator: 0,
                        owner: 0,
                        collectionContractAddress:
                            data.collectionContractAddress
                                ? data.collectionContractAddress
                                : null,
                        putOnSale: data.putonsale,
                        instantSalePrice: data.instantsaleprice,
                        unlockPurchased: data.unlockpurchased,
                        slug: data.name
                            ? data.name.toLowerCase().split(" ").join("-")
                            : null,
                        collection: "String",
                    },
                }
            );
        } catch (error) {
            console.log(error);
        }
    }

    const onSubmit = (data, e) => {
        console.log(data);
        const { target } = e;
        const submitBtn =
            target.localName === "span" ? target.parentElement : target;
        const isPreviewBtn = submitBtn.dataset?.btn;
        setHasImageError(!selectedImage);
        if (isPreviewBtn && selectedImage) {
            setPreviewData({ ...data, image: selectedImage });
            setShowProductModal(true);
        }
        if (!isPreviewBtn) {
            notify();
            reset();
            setSelectedImage();
            StoreData(data);
        }
    };

    /* async function MintNFT() {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const { utils } = ethers;
        const bytes = utils.formatBytes32String(signer);
        const contract = new ethers.Contract(
            CreateNFT.address,
            CreateNFT.abi,
            signer
        );
        const transaction = await contract.mint();
        const receipt = await transaction.wait();
    } */

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
                        value: data.name,
                        text: data.name,
                    })
                );
                console.log(results);
                setDataCollection(results);
            });
    }, []);
    // console.log(dataCollection);
    return (
        <>
            <div
                className={clsx(
                    "create-area",
                    space === 1 && "rn-section-gapTop",
                    className
                )}
            >
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
                                    {data?.type && (
                                        <h5>
                                            Selected Variants:{" "}
                                            {data?.type.toUpperCase()}
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
                                        {data?.type && (
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
                                                        value={data?.type.toUpperCase()}
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
                                        <div className="col-lg-6">
                                            <div className="collection-single-wized">
                                                <label
                                                    htmlFor="category"
                                                    className="title required"
                                                >
                                                    Category
                                                </label>
                                                <div className="create-collection-input">
                                                    {dataCollection && (
                                                        <NiceSelect
                                                            name="category"
                                                            placeholder="Add Category"
                                                            options={
                                                                dataCollection
                                                            }
                                                            onChange={
                                                                categoryHandler
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Collection Contract Address"
                                                    className="form-label"
                                                >
                                                    Collection Contract Address
                                                </label>
                                                <input
                                                    id="collectionContractAddress"
                                                    placeholder="Collection Contract Address"
                                                    {...register(
                                                        "collectionContractAddress"
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="price"
                                                    className="form-label"
                                                >
                                                    Item Price in $
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

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Size"
                                                    className="form-label"
                                                >
                                                    Size
                                                </label>
                                                <input
                                                    id="size"
                                                    placeholder="e. g. `Size`"
                                                    {...register("size", {
                                                        pattern: {
                                                            value: /^[0-9]+$/,
                                                            message:
                                                                "Please enter a number",
                                                        },
                                                        required:
                                                            "Size is required",
                                                    })}
                                                />
                                                {errors.size && (
                                                    <ErrorText>
                                                        {errors.size?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Propertie"
                                                    className="form-label"
                                                >
                                                    Properties
                                                </label>
                                                <input
                                                    id="propertiy"
                                                    placeholder="e. g. `Propertie`"
                                                    {...register("propertiy", {
                                                        required:
                                                            "Propertiy is required",
                                                    })}
                                                />
                                                {errors.propertiy && (
                                                    <ErrorText>
                                                        {
                                                            errors.propertiy
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-12">
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
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="Number Of Copies"
                                                    className="form-label"
                                                >
                                                    Number Of Copies
                                                </label>
                                                <input
                                                    id="numberOfCopies"
                                                    placeholder="e. g. `1-100`"
                                                    {...register(
                                                        "numberOfCopies",
                                                        {
                                                            pattern: {
                                                                value: /^[0-9]+$/,
                                                                message:
                                                                    "Please enter a number",
                                                            },
                                                        }
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-4">
                                            <div className="input-box pb--20 rn-check-box">
                                                <input
                                                    className="rn-check-box-input"
                                                    type="checkbox"
                                                    id="putonsale"
                                                    {...register("putonsale")}
                                                />
                                                <label
                                                    className="rn-check-box-label"
                                                    htmlFor="putonsale"
                                                >
                                                    Put on Sale
                                                </label>
                                            </div>
                                        </div>

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
                                        </div>

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
                                </div>
                                <div className="mt--100 mt_sm--30 mt_md--30 d-block d-lg-none">
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

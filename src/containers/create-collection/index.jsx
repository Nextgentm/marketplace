import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import CollectionModal from "@components/modals/collection-modal";
import ImageUpload from "@ui/image-upload";
import NiceSelect from "@ui/nice-select";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { isEmpty } from "@utils/methods";
import axios from "axios";
import { WalletData } from "src/context/wallet-context";
import { useRouter } from "next/router";
import {
    ETHEREUM_NETWORK_CHAIN_ID,
    POLYGON_NETWORK_CHAIN_ID,
} from "src/lib/constants";
import Factory721Contract from "../../contracts/json/Factory721.json";
import Factory1155Contract from "../../contracts/json/Factory1155.json";

const CreateCollectionArea = () => {
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [category, setCategory] = useState(""); // cateory
    const [blockchainNetwork, setBlockchainNetwork] = useState(""); // selected network
    const [hasCatError, setHasCatError] = useState(false);
    const [hasBlockchainNetworkError, setHasBlockchainNetworkError] =
        useState(false);
    const [previewData, setPreviewData] = useState({});

    const [logoImagePath, setLogoImagePath] = useState("");
    const [logoImageId, setlogoImageId] = useState("");

    const [coverImagePath, setCoverImagePath] = useState("");
    const [coverImageId, setCoverImageId] = useState("");

    const [featureImagePath, setFeatureImagePath] = useState("");
    const [featureImageId, setFeatureImageId] = useState("");
    // Get Wallet data
    const { walletData, setWalletData } = useContext(WalletData);
    // Get url param
    const router = useRouter();

    const categoryHandler = (item) => {
        setCategory(item.value);
    };
    const blockchainNetworkHandler = (item) => {
        setBlockchainNetwork(item.value);
    };

    const notify = () => toast("Your collection has submitted");

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

    watch(["logoImg", "featImg", "bannerImg"]);

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
        if (walletData.isConnected) {
            if (blockchainNetwork === "Ethereum") {
                switchNetwork(ETHEREUM_NETWORK_CHAIN_ID); // ethereum testnet
            } else if (blockchainNetwork === "Polygon") {
                switchNetwork(POLYGON_NETWORK_CHAIN_ID); // polygon testnet
            }
        }
    }, [blockchainNetwork]);

    async function updateImage(e) {
        if (logoImageId) {
            /** FOr Update Image */
            const formUpdateImage = new FormData();
            formUpdateImage.append("fileInfo", getValues(e)?.[0]);
            await fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload?id=${logoImageId}`,
                {
                    method: "post",
                    body: formUpdateImage,
                }
            )
                .then((response) => response.json())
                .then((res) => {
                    setLogoImagePath(JSON.stringify(res));
                    setlogoImageId(res?.id);
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
                    setLogoImagePath(JSON.stringify(res[0]));
                    setlogoImageId(res[0]?.id);
                });
        }
    }

    async function updateImage2(e) {
        if (featureImageId) {
            /** FOr Update Image */
            const formUpdateImage = new FormData();
            formUpdateImage.append("fileInfo", getValues(e)?.[0]);
            await fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload?id=${featureImageId}`,
                {
                    method: "post",
                    body: formUpdateImage,
                }
            )
                .then((response) => response.json())
                .then((res) => {
                    setFeatureImagePath(JSON.stringify(res));
                    setFeatureImageId(res?.id);
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
                    setFeatureImagePath(JSON.stringify(res[0]));
                    setFeatureImageId(res[0]?.id);
                });
        }
    }

    async function updateImage3(e) {
        if (coverImageId) {
            /** FOr Update Image */
            const formUpdateImage = new FormData();
            formUpdateImage.append("fileInfo", getValues(e)?.[0]);
            await fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload?id=${coverImageId}`,
                {
                    method: "post",
                    body: formUpdateImage,
                }
            )
                .then((response) => response.json())
                .then((res) => {
                    setCoverImagePath(JSON.stringify(res));
                    setCoverImageId(res?.id);
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
                    setCoverImagePath(JSON.stringify(res[0]));
                    setCoverImageId(res[0]?.id);
                });
        }
    }

    async function StoreData(data) {
        console.log(data);
        try {
            const logoImagePathObject = JSON.parse(logoImagePath);
            const coverImagePathObject = JSON.parse(coverImagePath);
            const featureImagePathObject = JSON.parse(featureImagePath);

            /* deploy smartcontract call */
            const deployedContractAddress = await blockchainCall();
            if (!deployedContractAddress) {
                return;
            }
            const deployed721ContractAddress = deployedContractAddress[0];
            const deployed1155ContractAddress = deployedContractAddress[1];
            // console.log(
            //     deployed721ContractAddress,
            //     deployed1155ContractAddress
            // );

            const resp = await axios.post(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections`,
                {
                    data: {
                        name: data.title ? data.title : null,
                        logo: logoImagePathObject || "Null",
                        logoID: Number(logoImageId),
                        cover: coverImagePathObject || "Null",
                        coverID: Number(coverImageId),
                        featured: featureImagePathObject || "Null",
                        featuredID: Number(featureImageId),
                        symbol: "String",
                        url: data.url ? data.url : null,
                        description: data.description ? data.description : null,
                        category,
                        slug: data.title.toLowerCase(),
                        creatorEarning: data.earning
                            ? Number(data.earning)
                            : null,
                        contractAddress: deployed721ContractAddress, // may be null
                        contractAddress1155: deployed1155ContractAddress, // may be null
                        collectionType:
                            router.query.type.charAt(0).toUpperCase() +
                            router.query.type.slice(1), // convert "single" to "Single"
                        payoutWalletAddress: data.wallet ? data.wallet : null,
                        explicitAndSensitiveContent: data.themeSwitch,
                    },
                }
            );
            notify();
            reset();
        } catch (error) {
            console.log(error);
            toast.error("Error while saving data");
        }
    }

    async function blockchainCall() {
        const signer = walletData.provider.getSigner();

        try {
            // deployed contract instance
            console.log(router.query.type); // type of NFT collection
            const salt = walletData.ethers.utils.formatBytes32String(
                walletData.account.slice(-31)
            );
            console.log(salt);
            if (router.query.type === "single") {
                // Pull the deployed contract instance
                const contract721 = new walletData.ethers.Contract(
                    Factory721Contract.address[blockchainNetwork],
                    Factory721Contract.abi,
                    signer
                );
                const transaction = await contract721.deploy(salt, "", "", "");
                const receipt = await transaction.wait();
                console.log(receipt);
                console.log(
                    "contractAddress",
                    receipt.events[0].args.contractAddress
                );
                const erc721ContractAddr =
                    receipt.events[0].args.contractAddress;
                return [erc721ContractAddr, null];
            }
            if (router.query.type === "multiple") {
                // Pull the deployed contract instance
                const contract1155 = new walletData.ethers.Contract(
                    Factory1155Contract.address[blockchainNetwork],
                    Factory1155Contract.abi,
                    signer
                );
                const transaction = await contract1155.deploy(salt, "", "", "");
                const receipt = await transaction.wait();
                console.log(receipt);
                console.log(
                    "contractAddress",
                    receipt.events[0].args.contractAddress
                );
                const erc1155ContractAddr =
                    receipt.events[0].args.contractAddress;
                return [null, erc1155ContractAddr];
            }
            if (router.query.type === "hybrid") {
                // Pull the deployed contract instance
                const contract721 = new walletData.ethers.Contract(
                    Factory721Contract.address[blockchainNetwork],
                    Factory721Contract.abi,
                    signer
                );
                const transaction1 = await contract721.deploy(salt, "", "", "");
                const receipt1 = await transaction1.wait();
                console.log(receipt1);
                console.log(
                    "contractAddress",
                    receipt1.events[0].args.contractAddress
                );
                const erc721ContractAddr =
                    receipt1.events[0].args.contractAddress;

                // Pull the deployed contract instance
                const contract1155 = new walletData.ethers.Contract(
                    Factory1155Contract.address[blockchainNetwork],
                    Factory1155Contract.abi,
                    signer
                );
                const transaction2 = await contract1155.deploy(
                    salt,
                    "",
                    "",
                    ""
                );
                const receipt2 = await transaction2.wait();
                console.log(receipt);
                console.log(
                    "contractAddress",
                    receipt2.events[0].args.contractAddress
                );
                const erc1155ContractAddr =
                    receipt2.events[0].args.contractAddress;
                return [erc721ContractAddr, erc1155ContractAddr];
            }
            toast.error("Please select proper collection type");
            return null;
        } catch (error) {
            console.log(error);
            toast.error("Error while deploying contract");
            return null;
        }
    }

    const onSubmit = (data, e) => {
        // console.log(data, e);
        /** if Wallet not connected */
        if (!walletData.isConnected) {
            toast.error("Please connect wallet first");
            return;
        } // chnage network
        if (blockchainNetwork === "Ethereum") {
            if (!switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
                // ethereum testnet
                return;
            }
        } else if (blockchainNetwork === "Polygon") {
            if (!switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
                // polygon testnet
                return;
            }
        }

        /** Show Error if form not submited correctly */
        setHasCatError(!category);
        setHasBlockchainNetworkError(!blockchainNetwork);
        if (!blockchainNetwork || !category) {
            return;
        }
        /** code for fetching submited button value */
        // console.log(e.nativeEvent.submitter.name);
        if (showPreviewModal) {
            setPreviewData({ ...data, image: data.logoImg[0] });
            setShowPreviewModal(true);
        }
        if (!showPreviewModal) {
            StoreData(data);
        }
    };

    return (
        <>
            <div className="creat-collection-area pt--80">
                <div className="container">
                    <form
                        className="row g-5"
                        encType="multipart/form-data"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="col-lg-3 offset-1 ml_md--0 ml_sm--0">
                            <div className="collection-single-wized banner">
                                <label
                                    htmlFor="logoImg"
                                    className="title required"
                                >
                                    Logo image
                                </label>

                                <ImageUpload
                                    className="logo-image"
                                    id="logoImg"
                                    placeholder={{
                                        src: "/images/profile/profile-01.jpg",
                                        width: 277,
                                        height: 277,
                                    }}
                                    preview={getValues("logoImg")?.[0]}
                                    {...register("logoImg", {
                                        required: "Upload logo image",
                                        onChange: (e) => {
                                            updateImage("logoImg");
                                        },
                                    })}
                                />

                                {errors.logoImg && (
                                    <ErrorText>
                                        {errors.logoImg?.message}
                                    </ErrorText>
                                )}
                            </div>

                            <div className="collection-single-wized banner">
                                <label htmlFor="featImg" className="title">
                                    Cover Image
                                </label>
                                <ImageUpload
                                    className="feature-image"
                                    id="featImg"
                                    placeholder={{
                                        src: "/images/profile/cover-04.jpg",
                                        width: 277,
                                        height: 138,
                                    }}
                                    preview={getValues("featImg")?.[0]}
                                    {...register("featImg", {
                                        onChange: (e) => {
                                            updateImage2("featImg");
                                        },
                                    })}
                                />
                                {errors.featImg && (
                                    <ErrorText>
                                        {errors.featImg?.message}
                                    </ErrorText>
                                )}
                            </div>

                            <div className="collection-single-wized banner">
                                <label htmlFor="bannerImg" className="title">
                                    Featured image
                                </label>
                                <ImageUpload
                                    className="banner-image"
                                    id="bannerImg"
                                    placeholder={{
                                        src: "/images/profile/cover-03.jpg",
                                        width: 277,
                                        height: 60,
                                    }}
                                    preview={getValues("bannerImg")?.[0]}
                                    {...register("bannerImg", {
                                        onChange: (e) => {
                                            updateImage3("bannerImg");
                                        },
                                    })}
                                />
                                {errors.bannerImg && (
                                    <ErrorText>
                                        {errors.bannerImg?.message}
                                    </ErrorText>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="create-collection-form-wrapper">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="title"
                                                className="title required"
                                            >
                                                Name
                                            </label>
                                            <div className="create-collection-input">
                                                <input
                                                    className="name"
                                                    type="text"
                                                    id="name"
                                                    {...register("title", {
                                                        required:
                                                            "title is required",
                                                    })}
                                                />
                                                {errors.title && (
                                                    <ErrorText>
                                                        {errors.title?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="url"
                                                className="title"
                                            >
                                                URL
                                            </label>
                                            <div className="create-collection-input">
                                                <input
                                                    className="url"
                                                    type="text"
                                                    id="url"
                                                    {...register("url")}
                                                />
                                                {errors.url && (
                                                    <ErrorText>
                                                        {errors.url?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
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
                                                <NiceSelect
                                                    name="category"
                                                    placeholder="Add Category"
                                                    options={[
                                                        {
                                                            value: "Art",
                                                            text: "Art",
                                                        },
                                                        {
                                                            value: "Domain Names",
                                                            text: "Domain Names",
                                                        },
                                                        {
                                                            value: "Memberships",
                                                            text: "Memberships",
                                                        },
                                                        {
                                                            value: "Music",
                                                            text: "Music",
                                                        },
                                                        {
                                                            value: "PFPs",
                                                            text: "PFPs",
                                                        },
                                                        {
                                                            value: "Photography",
                                                            text: "Photography",
                                                        },
                                                        {
                                                            value: "Sports Collectibles",
                                                            text: "Sports Collectibles",
                                                        },
                                                        {
                                                            value: "Virtual World",
                                                            text: "Virtual World",
                                                        },
                                                        {
                                                            value: "No category",
                                                            text: "No category",
                                                        },
                                                    ]}
                                                    onChange={categoryHandler}
                                                />
                                                {((!category &&
                                                    !isEmpty(errors)) ||
                                                    hasCatError) && (
                                                        <ErrorText>
                                                            Select a category
                                                        </ErrorText>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="blockchain"
                                                className="title required"
                                            >
                                                Blockchain
                                            </label>
                                            <div className="create-collection-input">
                                                <NiceSelect
                                                    name="blockchain"
                                                    placeholder="Add Blockchain"
                                                    options={
                                                        walletData.isConnected
                                                            ? [
                                                                {
                                                                    value: "Ethereum",
                                                                    text: "Ethereum",
                                                                },
                                                                {
                                                                    value: "Polygon",
                                                                    text: "Polygon",
                                                                },
                                                            ]
                                                            : []
                                                    }
                                                    onChange={
                                                        blockchainNetworkHandler
                                                    }
                                                />
                                                {((!blockchainNetwork &&
                                                    !isEmpty(errors)) ||
                                                    hasBlockchainNetworkError) && (
                                                        <ErrorText>
                                                            Select blockchain
                                                        </ErrorText>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="description"
                                                className="title"
                                            >
                                                Description
                                            </label>
                                            <div className="create-collection-input">
                                                <textarea
                                                    className="text-area"
                                                    {...register("description")}
                                                />
                                                {errors.description && (
                                                    <ErrorText>
                                                        {
                                                            errors.description
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="earning"
                                                className="title"
                                            >
                                                Creator Earnings
                                            </label>
                                            <div className="create-collection-input">
                                                <input
                                                    id="earning"
                                                    className="url"
                                                    type="text"
                                                    {...register("earning")}
                                                />
                                                {errors.earning && (
                                                    <ErrorText>
                                                        {
                                                            errors.earning
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="wallet"
                                                className="title required"
                                            >
                                                Your payout wallet address
                                            </label>
                                            <div className="create-collection-input">
                                                <input
                                                    id="wallet"
                                                    className="url"
                                                    type="text"
                                                    {...register("wallet", {
                                                        required:
                                                            "wallet address is required",
                                                    })}
                                                />
                                                {errors.wallet && (
                                                    <ErrorText>
                                                        {errors.wallet?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="nuron-information mb--30">
                                            <div className="single-notice-setting">
                                                <div className="input">
                                                    <input
                                                        type="checkbox"
                                                        id="themeSwitch"
                                                        name="theme-switch"
                                                        className="theme-switch__input"
                                                        {...register(
                                                            "themeSwitch"
                                                        )}
                                                    />
                                                    <label
                                                        htmlFor="themeSwitch"
                                                        className="theme-switch__label"
                                                    >
                                                        <span />
                                                    </label>
                                                </div>
                                                <div className="content-text">
                                                    <p>
                                                        Explicit &amp; sensitive
                                                        content
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="button-wrapper">
                                            <Button
                                                className="mr--30"
                                                type="submit"
                                                data-btn="preview"
                                                name="preview"
                                                value="preview"
                                                onClick={() =>
                                                    setShowPreviewModal(true)
                                                }
                                            >
                                                Preview
                                            </Button>
                                            <Button
                                                type="submit"
                                                color="primary-alta"
                                                data-btn="create"
                                                name="create"
                                                value="create"
                                                onClick={() =>
                                                    setShowPreviewModal(false)
                                                }
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {showPreviewModal && (
                <CollectionModal
                    show={showPreviewModal}
                    handleModal={() => setShowPreviewModal(false)}
                    data={previewData}
                />
            )}
        </>
    );
};

export default CreateCollectionArea;

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
import { AppData } from "src/context/app-context";
import { useRouter } from "next/router";
import Multiselect from "multiselect-react-dropdown";
import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID, BINANCE_NETWORK_CHAIN_ID } from "src/lib/constants";
import { getERC721FactoryContract, getERC1155FactoryContract, addressIsAdmin } from "src/lib/BlokchainHelperFunctions";
import strapi from "@utils/strapi";
import { Messages } from "@utils/constants";
import { ethers } from "ethers";

const categoryOptionsList = [
  {
    value: "Art",
    text: "Art"
  },
  {
    value: "Domain Names",
    text: "Domain Names"
  },
  {
    value: "Memberships",
    text: "Memberships"
  },
  {
    value: "Music",
    text: "Music"
  },
  {
    value: "PFPs",
    text: "PFPs"
  },
  {
    value: "Photography",
    text: "Photography"
  },
  {
    value: "Sports Collectibles",
    text: "Sports Collectibles"
  },
  {
    value: "Virtual World",
    text: "Virtual World"
  },
  {
    value: "No category",
    text: "No category"
  }
];

const blockchainNetworkOptionsList = [
  {
    value: "Ethereum",
    text: "Ethereum"
  },
  {
    value: "Polygon",
    text: "Polygon"
  },
  {
    value: "Binance",
    text: "Binance"
  },
];

const convertPaymentTokenObjToOptions = (arr) => {
  const results = [];
  arr.data.map((data) =>
    results.push({
      value: data.id,
      key: data.name
    })
  );
  return results;
}

const CreateCollectionArea = ({ collection }) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [category, setCategory] = useState(""); // cateory
  const [blockchainNetwork, setBlockchainNetwork] = useState(""); // selected network
  const [hasCatError, setHasCatError] = useState(false);
  const [hasBlockchainNetworkError, setHasBlockchainNetworkError] = useState(false);
  const [previewData, setPreviewData] = useState({});

  const [logoImagePath, setLogoImagePath] = useState("");
  const [logoImageId, setlogoImageId] = useState("");

  const [coverImagePath, setCoverImagePath] = useState("");
  const [coverImageId, setCoverImageId] = useState("");

  const [featureImagePath, setFeatureImagePath] = useState("");
  const [featureImageId, setFeatureImageId] = useState("");

  const [paymentTokensData, setPaymentTokensData] = useState(null);
  const [selectedPaymentTokens, setSelectedPaymentTokens] = useState([]);
  // Get Wallet data
  const { walletData,
    changeNetworkByNetworkType,
    checkAndConnectWallet
  } = useContext(AppData);

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
    watch
  } = useForm({
    mode: "onChange"
  });

  watch(["logoImg", "featImg", "bannerImg"]);

  async function switchNetwork(chainId) {
    if (parseInt(window.ethereum.networkVersion, 2) === parseInt(chainId, 2)) {
      console.log(`Network is already with chain id ${chainId}`);
      return true;
    }
    try {
      const res = await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }]
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
      } else if (blockchainNetwork === "Binance") {
        switchNetwork(BINANCE_NETWORK_CHAIN_ID); // binance testnet
      }
    }
  }, [blockchainNetwork]);

  useEffect(() => {
    strapi.find("payment-tokens").then((response) => {
      const results = convertPaymentTokenObjToOptions(response);
      setPaymentTokensData(results);
    });
  }, []);

  //load collection data
  useEffect(() => {
    if (collection) {
      setSelectedPaymentTokens(convertPaymentTokenObjToOptions(collection?.paymentTokens));
      setCategory(collection?.category);
      setBlockchainNetwork(collection?.networkType);
      // setLogoImagePath(collection.logo.data.url);
      // setlogoImageId(collection.logoID);
      // setCoverImagePath(collection.cover.data.url);
      // setCoverImageId(collection.coverID);
      // setFeatureImagePath(collection.featured.data.url);
      // setFeatureImageId(collection.featuredID);
    }
  }, [collection]);

  const updateCollection = async (data, e) => {
    try {
      if (!walletData.isConnected) {
        let res = await checkAndConnectWallet(blockchainNetwork);
        if (!res) return;
      }
      const validationValue = await addressIsAdmin(walletData);
      if (validationValue) {
        const slug = data.title ? data.title.toLowerCase().split(" ").join("-") : null;
        const selectedPaymentTokensList = Array.from(selectedPaymentTokens).map(({ value }) => value);
        // console.log(selectedPaymentTokens);
        let updatedCollectionObj = {
          name: data.title ? data.title : collection?.name,
          symbol: data.symbol,
          url: data.url ? data.url : collection?.url,
          description: data.description ? data.description : collection?.description,
          category,
          slug,
          paymentTokens: selectedPaymentTokensList,
          payoutWalletAddress: data.wallet ? data.wallet : collection?.payoutWalletAddress,
          explicitAndSensitiveContent: data.themeSwitch
        }
        if (logoImagePath) {
          updatedCollectionObj.logo = JSON.parse(logoImagePath);
          updatedCollectionObj.logoID = Number(logoImageId);
        }
        if (coverImagePath) {
          updatedCollectionObj.cover = JSON.parse(coverImagePath);
          updatedCollectionObj.coverID = Number(coverImageId);
        }
        if (featureImagePath) {
          updatedCollectionObj.featured = JSON.parse(featureImagePath);
          updatedCollectionObj.featuredID = Number(featureImageId);
        }
        // console.log(updatedCollectionObj);
        const resp = await strapi.update("collections", collection?.id, updatedCollectionObj);
        console.log(resp);
        toast("Collection updated successfully");
      } else {
        toast.error("Only admin can update collection");
      }
    } catch (error) {
      toast.error("Error while updating collection");
      console.log(error);
    }
  }

  async function updateImage(e) {
    if (logoImageId) {
      /** FOr Update Image */
      const formUpdateImage = new FormData();
      formUpdateImage.append("fileInfo", getValues(e)?.[0]);
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload?id=${logoImageId}`, {
        method: "post",
        body: formUpdateImage
      })
        .then((response) => response.json())
        .then((res) => {
          setLogoImagePath(JSON.stringify(res));
          setlogoImageId(res?.id);
        });
    } else {
      const formData = new FormData();
      formData.append("files", getValues(e)?.[0]);
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`, {
        method: "post",
        body: formData
      })
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
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload?id=${featureImageId}`, {
        method: "post",
        body: formUpdateImage
      })
        .then((response) => response.json())
        .then((res) => {
          setFeatureImagePath(JSON.stringify(res));
          setFeatureImageId(res?.id);
        });
    } else {
      const formData = new FormData();
      formData.append("files", getValues(e)?.[0]);
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`, {
        method: "post",
        body: formData
      })
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
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload?id=${coverImageId}`, {
        method: "post",
        body: formUpdateImage
      })
        .then((response) => response.json())
        .then((res) => {
          setCoverImagePath(JSON.stringify(res));
          setCoverImageId(res?.id);
        });
    } else {
      const formData = new FormData();
      formData.append("files", getValues(e)?.[0]);
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`, {
        method: "post",
        body: formData
      })
        .then((response) => response.json())
        .then((res) => {
          setCoverImagePath(JSON.stringify(res[0]));
          setCoverImageId(res[0]?.id);
        });
    }
  }

  async function StoreData(data) {
    try {
      const logoImagePathObject = JSON.parse(logoImagePath);
      const coverImagePathObject = JSON.parse(coverImagePath);
      const featureImagePathObject = JSON.parse(featureImagePath);
      console.log("::: data true :::");
      /* deploy smartcontract call */
      const deployedContractAddress = await blockchainCall(data.title, data.symbol, data.url);
      if (!deployedContractAddress) {
        return;
      }
      console.log("::: deployedContractAddress data true :::");

      const deployed721ContractAddress = deployedContractAddress[0];
      const deployed1155ContractAddress = deployedContractAddress[1];
      // console.log(
      //     deployed721ContractAddress,
      //     deployed1155ContractAddress
      // );

      console.log(" selectedPaymentTokens is ::::::", selectedPaymentTokens);
      const selectedPaymentTokensList = Array.from(selectedPaymentTokens).map(({ value }) => value);
      console.log("::: selectedPaymentTokensList data true :::",selectedPaymentTokensList);
      const slug = data.title ? data.title.toLowerCase().split(" ").join("-") : null;
      console.log(" slug is ::::::::::: ", slug)
      console.log("::: slug data true :::",{
        name: data.title ? data.title : null,
        logo: logoImagePathObject || "Null",
        logoID: Number(logoImageId),
        cover: coverImagePathObject || "Null",
        coverID: Number(coverImageId),
        featured: featureImagePathObject || "Null",
        featuredID: Number(featureImageId),
        symbol: data.symbol,
        url: data.url ? data.url : null,
        description: data.description ? data.description : null,
        category,
        slug,
        // creatorEarning: data.earning
        //     ? Number(data.earning)
        //     : null,
        networkType: blockchainNetwork,
        paymentTokens: selectedPaymentTokensList,
        contractAddress: deployed721ContractAddress, // may be null
        contractAddress1155: deployed1155ContractAddress, // may be null
        ownerAddress: walletData.account,
        collectionType: router.query.type.charAt(0).toUpperCase() + router.query.type.slice(1), // convert "single" to "Single"
        payoutWalletAddress: data.wallet ? data.wallet : null,
        explicitAndSensitiveContent: data.themeSwitch
      });
      const resp = await strapi.create("collections", {
        name: data.title ? data.title : null,
        logo: logoImagePathObject || "Null",
        logoID: Number(logoImageId),
        cover: coverImagePathObject || "Null",
        coverID: Number(coverImageId),
        featured: featureImagePathObject || "Null",
        featuredID: Number(featureImageId),
        symbol: data.symbol,
        url: data.url ? data.url : null,
        description: data.description ? data.description : null,
        category,
        slug,
        // creatorEarning: data.earning
        //     ? Number(data.earning)
        //     : null,
        networkType: blockchainNetwork,
        paymentTokens: selectedPaymentTokensList,
        contractAddress: deployed721ContractAddress, // may be null
        contractAddress1155: deployed1155ContractAddress, // may be null
        ownerAddress: walletData.account,
        collectionType: router.query.type.charAt(0).toUpperCase() + router.query.type.slice(1), // convert "single" to "Single"
        payoutWalletAddress: data.wallet ? data.wallet : null,
        explicitAndSensitiveContent: data.themeSwitch

      });
      console.log(resp);
      notify();
      reset();
      if (router.query.type === "single") {
        router.push(`/create?type=single&collection=${slug}`);
      }
      if (router.query.type === "multiple") {
        router.push(`/create?type=multiple&collection=${slug}`);
      }
      if (router.query.type === "hybrid") {
        router.push(`/upload-variants?collection=${slug}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while saving data");
    }
  }

  async function blockchainCall(name, symbol, tokenURIPrefix) {
    const signer = walletData.provider.getSigner();

    try {
      // deployed contract instance
      console.log(router.query.type); // type of NFT collection
      const salt = walletData.ethers.utils.formatBytes32String(walletData.account.slice(-31));
      console.log("salt is :::::::::",salt);
      if (router.query.type === "single") {
        // Pull the deployed contract instance
        const contract721 = await getERC721FactoryContract(walletData);
        const transaction = await contract721.deploy(salt, name, symbol, tokenURIPrefix);
        const receipt = await transaction.wait();
        // console.log(receipt);
        const correctEvent = receipt.events.find((event) => event.event === "Deployed");
        console.log("contractAddress", correctEvent.args.contractAddress);
        const erc721ContractAddr = correctEvent.args.contractAddress;
        return [erc721ContractAddr, null];
      }
      if (router.query.type === "multiple") {
        // Pull the deployed contract instance
        const contract1155 = await getERC1155FactoryContract(walletData);
        console.log(" contract is :::::::: ", contract1155)

        // Get deploy ABI entry
        const deployAbi = walletData?.contractData?.Factory1155Contract?.abi?.find(x => x?.type === "function" && x?.name === "deploy");
        console.log(" abi is :::::::::::::::::: ", deployAbi)
        // ensure values are correctly set and typed
        console.log(" toke data is :: ",salt, "name ", name, "symbol ", symbol, "token is", tokenURIPrefix );

        // ---------- SAFE COERCION / DEFAULTS ----------
        // Ensure salt is bytes32 hex
        let saltSafe = salt;
        if (!saltSafe || !/^0x[0-9a-fA-F]{64}$/.test(String(saltSafe))) {
          // fallback to deterministic id if original salt isn't a proper 32-byte hex
          saltSafe = ethers.utils.id(String(saltSafe ?? walletData.account ?? ""));
          console.log("salt was not valid bytes32, using saltSafe:", saltSafe);
        }

        const transaction = await contract1155.deploy(saltSafe, name, symbol, tokenURIPrefix);
        console.log(" after transaction ");
        const receipt = await transaction.wait();
        console.log(" receipt transaction ");
        // console.log(receipt);
        const correctEvent = receipt.events.find((event) => event.event === "Deployed");
        console.log("contractAddress", correctEvent.args.contractAddress);
        const erc1155ContractAddr = correctEvent.args.contractAddress;
        return [null, erc1155ContractAddr];
      }
      if (router.query.type === "hybrid") {
        // Pull the deployed contract instance
        const contract721 = await getERC721FactoryContract(walletData);
        const transaction1 = await contract721.deploy(salt, name, symbol, tokenURIPrefix);
        const receipt1 = await transaction1.wait();
        // console.log(receipt);
        const correctEvent1 = receipt1.events.find((event) => event.event === "Deployed");
        console.log("contractAddress", correctEvent1.args.contractAddress);
        const erc721ContractAddr = correctEvent1.args.contractAddress;

        // Pull the deployed contract instance
        const contract1155 = await getERC1155FactoryContract(walletData);
        const transaction2 = await contract1155.deploy(salt, name, symbol, tokenURIPrefix);
        const receipt2 = await transaction2.wait();
        // console.log(receipt);
        const correctEvent2 = receipt2.events.find((event) => event.event === "Deployed");
        console.log("contractAddress", correctEvent2.args.contractAddress);
        const erc1155ContractAddr = correctEvent2.args.contractAddress;
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

  const onSubmit = async (data, e) => {
    const { target } = e;
    const submitBtn = target.localName === "span" ? target.parentElement : target;
    const isPreviewBtn = submitBtn.dataset?.btn;
    console.log(isPreviewBtn);
    // console.log(data, e);
    /** if Wallet not connected */
    if (!walletData.isConnected) {
      let res = await checkAndConnectWallet(blockchainNetwork);
      if (!res) return;
    }
    // chnage network
    let networkChanged = await changeNetworkByNetworkType(blockchainNetwork);
    if (!networkChanged) {
      // ethereum testnet
      toast.error(Messages.WALLET_NETWORK_CHNAGE_FAILED);
      return;
    }

    /** Show Error if form not submited correctly */
    setHasCatError(!category);
    setHasBlockchainNetworkError(!blockchainNetwork);
    if (!blockchainNetwork || !category) {
      return;
    }
    /** code for fetching submited button value */
    // console.log(e.nativeEvent.submitter.name);
    if (isPreviewBtn) {
      setPreviewData({ ...data, image: data.logoImg[0] });
      setShowPreviewModal(true);
    }
    if (!isPreviewBtn) {
      StoreData(data);
    }
  };

  return (
    <>
      <div className="creat-collection-area pt--80">
        <div className="container">
          <form className="row g-5" encType="multipart/form-data" onSubmit={collection ? handleSubmit(updateCollection) : handleSubmit(onSubmit)}>
            <div className="col-lg-3 offset-1 ml_md--0 ml_sm--0">
              <div className="collection-single-wized banner">
                <label htmlFor="logoImg" className="title required">
                  Logo image
                </label>

                <ImageUpload
                  className="logo-image"
                  id="logoImg"
                  placeholder={{
                    src: collection ? collection?.logo?.data?.url : "/images/profile/profile-01.jpg",
                    width: 277,
                    height: 277
                  }}
                  preview={getValues("logoImg")?.[0]}
                  {...register("logoImg", collection ? {
                    onChange: (e) => {
                      updateImage("logoImg");
                    }
                  } : {
                    required: "Upload logo image",
                    onChange: (e) => {
                      updateImage("logoImg");
                    }
                  }
                  )}
                />
                <label htmlFor="logoImg" className="imagerecommended">
                  4500 x 4500px recommended
                </label>
                {errors.logoImg && <ErrorText>{errors.logoImg?.message}</ErrorText>}
              </div>

              <div className="collection-single-wized banner">
                <label htmlFor="featImg" className="title">
                  Cover Image
                </label>
                <ImageUpload
                  className="feature-image"
                  id="featImg"
                  placeholder={{
                    src: collection ? collection?.cover?.data?.url : "/images/profile/cover-04.jpg",
                    width: 277,
                    height: 138
                  }}
                  preview={getValues("featImg")?.[0]}
                  {...register("featImg", {
                    onChange: (e) => {
                      updateImage2("featImg");
                    }
                  })}
                />
                <label htmlFor="featImg" className="imagerecommended">
                  590 x 420px recommended
                </label>
                {errors.featImg && <ErrorText>{errors.featImg?.message}</ErrorText>}
              </div>

              <div className="collection-single-wized banner">
                <label htmlFor="bannerImg" className="title">
                  Featured image
                </label>
                <ImageUpload
                  className="banner-image"
                  id="bannerImg"
                  placeholder={{
                    src: collection ? collection?.featured?.data?.url : "/images/profile/cover-03.jpg",
                    width: 277,
                    height: 60
                  }}
                  preview={getValues("bannerImg")?.[0]}
                  {...register("bannerImg", {
                    onChange: (e) => {
                      updateImage3("bannerImg");
                    }
                  })}
                />
                <label htmlFor="bannerImg" className="imagerecommended">
                  590 x 420px recommended
                </label>

                {errors.bannerImg && <ErrorText>{errors.bannerImg?.message}</ErrorText>}
              </div>
            </div>
            <div className="col-lg-7">
              <div className="create-collection-form-wrapper">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="collection-single-wized">
                      <label htmlFor="title" className="title required">
                        Name
                      </label>
                      <div className="create-collection-input">
                        <input
                          className="name"
                          type="text"
                          id="name"
                          defaultValue={collection ? collection?.name : ""}
                          {...register("title", {
                            required: "title is required"
                          })}
                        />
                        {errors.title && <ErrorText>{errors.title?.message}</ErrorText>}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="collection-single-wized">
                      <label htmlFor="symbol" className="title">
                        Symbol
                      </label>
                      <div className="create-collection-input">
                        <input className="symbol" type="text" id="symbol" defaultValue={collection ? collection?.symbol : ""} {...register("symbol")} />
                        {errors.symbol && <ErrorText>{errors.symbol?.message}</ErrorText>}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="collection-single-wized">
                      <label htmlFor="url" className="title">
                        URL
                      </label>
                      <div className="create-collection-input">
                        <input className="url" type="text" id="url" defaultValue={collection ? collection?.url : ""} {...register("url")} />
                        {errors.url && <ErrorText>{errors.url?.message}</ErrorText>}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="collection-single-wized">
                      <label htmlFor="category" className="title required">
                        Category
                      </label>
                      <div className="create-collection-input">
                        <NiceSelect
                          name="category"
                          placeholder="Add Category"
                          options={categoryOptionsList}
                          defaultCurrent={collection?.category ? categoryOptionsList.findIndex(obj => obj.value == collection?.category) : -1}
                          onChange={categoryHandler}
                        />
                        {((!category && !isEmpty(errors)) || hasCatError) && <ErrorText>Select a category</ErrorText>}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="collection-single-wized">
                      <label htmlFor="blockchain" className="title required">
                        Blockchain
                      </label>
                      <div className="create-collection-input">
                        <NiceSelect
                          name="blockchain"
                          placeholder="Add Blockchain"
                          options={
                            collection?.networkType ?
                              [blockchainNetworkOptionsList.find(obj => obj.value == collection?.networkType)] :
                              walletData.isConnected
                                ? blockchainNetworkOptionsList
                                : []
                          }
                          defaultCurrent={collection ? 0 : -1}
                          onChange={blockchainNetworkHandler}
                        />
                        {((!blockchainNetwork && !isEmpty(errors)) || hasBlockchainNetworkError) && (
                          <ErrorText>Select blockchain</ErrorText>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="collection-single-wized">
                      <label htmlFor="description" className="title">
                        Description
                      </label>
                      <div className="create-collection-input">
                        <textarea className="text-area" {...register("description")} defaultValue={collection ? collection?.description : ""} />
                        {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
                      </div>
                    </div>
                  </div>
                  {/* <div className="col-lg-6">
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
                                    </div> */}
                  <div className="col-lg-6">
                    <div className="collection-single-wized">
                      <label htmlFor="paymentTokens" className="title">
                        Payment Tokens
                      </label>
                      <div className="create-collection-input">
                        {paymentTokensData && (
                          <Multiselect
                            id="paymentTokens"
                            options={paymentTokensData}
                            displayValue="key"
                            onRemove={(event) => {
                              setSelectedPaymentTokens(event);
                            }}
                            onSelect={(event) => {
                              setSelectedPaymentTokens(event);
                            }}
                            selectedValues={collection?.paymentTokens ? convertPaymentTokenObjToOptions(collection?.paymentTokens) : []}
                            showCheckbox
                          />
                        )}
                        {/* <select
                                                    id="paymentTokens"
                                                    multiple="multiple"
                                                >
                                                    {paymentTokensData &&
                                                        paymentTokensData.map(
                                                            (data) => (
                                                                <option
                                                                    value={
                                                                        data.value
                                                                    }
                                                                >
                                                                    {data.text}
                                                                </option>
                                                            )
                                                        )}
                                                </select> */}
                        {errors.paymentTokens && <ErrorText>{errors.paymentTokens?.message}</ErrorText>}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="collection-single-wized">
                      <label htmlFor="wallet" className="title required">
                        Your payout wallet address
                      </label>
                      <div className="create-collection-input">
                        <input
                          id="wallet"
                          className="url"
                          type="text"
                          defaultValue={collection ? collection?.payoutWalletAddress : ""}
                          {...register("wallet", {
                            required: "wallet address is required"
                          })}
                        />
                        {errors.wallet && <ErrorText>{errors.wallet?.message}</ErrorText>}
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
                            {...register("themeSwitch")}
                          />
                          <label htmlFor="themeSwitch" className="theme-switch__label">
                            <span />
                          </label>
                        </div>
                        <div className="content-text">
                          <p>Explicit &amp; sensitive content</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="button-wrapper">
                      {collection ?
                        <Button
                          type="submit"
                          color="primary-alta"
                          data-btn="update"
                          name="update"
                          value="update"
                        >
                          Update Collection
                        </Button> : <>
                          <Button className="mr--30" type="submit" data-btn="preview" onClick={handleSubmit(onSubmit)}>
                            Preview
                          </Button>
                          <Button
                            type="submit"
                            color="primary-alta"
                            data-btn="create"
                            name="create"
                            value="create"
                            onClick={() => setShowPreviewModal(false)}
                          >
                            Create
                          </Button>
                        </>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {showPreviewModal && (
        <CollectionModal show={showPreviewModal} handleModal={() => setShowPreviewModal(false)} data={previewData} />
      )}
    </>
  );
};

export default CreateCollectionArea;

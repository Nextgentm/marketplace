/* eslint quotes: "off" */
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
import {
  ETHEREUM_NETWORK_CHAIN_ID,
  POLYGON_NETWORK_CHAIN_ID,
  BINANCE_NETWORK_CHAIN_ID,
  SOMNIA_NETWORK_CHAIN_ID,
  NETWORKS,
  getChainIdByNetworkName
} from "src/lib/constants";
import { getERC721FactoryContract, getERC1155FactoryContract, addressIsAdmin } from "src/lib/BlokchainHelperFunctions";
import strapi from "@utils/strapi";
import { Messages, NETWORK_NAMES } from "@utils/constants";
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
  {
    value: "Somnia",
    text: "Somnia"
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
  const collectionType = router.query.type === "single" ? "Single" :
    router.query.type === "multiple" ? "Multiple" :
      router.query.type === "hybrid" ? "Hybrid" : "Single";

  const categoryHandler = (item) => {
    setCategory(item.value);
  };
  const blockchainNetworkHandler = (item) => {
    console.log("Selected network:", item.value);
    setBlockchainNetwork(item.value);
    setHasBlockchainNetworkError(false);
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
    try {
      console.log("Attempting to switch to network with chain ID:", chainId);

      // Convert current network version to hex for comparison
      const currentChainId = window.ethereum.networkVersion ?
        `0x${parseInt(window.ethereum.networkVersion).toString(16)}`.toLowerCase() :
        (await window.ethereum.request({ method: 'eth_chainId' })).toLowerCase();

      const targetChainId = chainId.toLowerCase();
      console.log("Current chain ID:", currentChainId);
      console.log("Target chain ID:", targetChainId);

      // Check if we're already on the correct network
      if (currentChainId === targetChainId) {
        console.log(`Already on network with chain id ${chainId}`);
        return true;
      }

      // Try to switch network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }]
        });
        console.log(`Successfully switched to network ${chainId}`);
        return true;
      } catch (switchError) {
        console.log("Switch error:", switchError);

        // If network is not added to MetaMask
        if (switchError.code === 4902) {
          try {
            // Add the network to MetaMask
            const networkConfig = NETWORKS[chainId];
            if (!networkConfig) {
              console.error("Network configuration not found for chain ID:", chainId);
              toast.error("Invalid network configuration");
              return false;
            }

            console.log("Adding network config:", networkConfig);

            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: networkConfig.chainId,
                chainName: networkConfig.chainName,
                nativeCurrency: networkConfig.nativeCurrency,
                rpcUrls: networkConfig.rpcUrls,
                blockExplorerUrls: networkConfig.blockExplorerUrls
              }]
            });

            // Network is added, no need to switch again as MetaMask does it automatically
            return true;
          } catch (addError) {
            console.error("Error adding network:", addError);
            toast.error("Failed to add network to MetaMask");
            return false;
          }
        }

        // If user rejected the request
        if (switchError.code === 4001) {
          toast.error("User rejected network switch");
          return false;
        }

        toast.error("Failed to switch network");
        return false;
      }
    } catch (error) {
      console.error("Network switch error:", error);
      toast.error("Failed to switch network");
      return false;
    }
  }

  useEffect(() => {
    if (walletData.isConnected && blockchainNetwork) {
      const switchToNetwork = async () => {
        const chainId = getChainIdByNetworkName(blockchainNetwork);
        if (!chainId) {
          console.error("Invalid network name:", blockchainNetwork);
          setHasBlockchainNetworkError(true);
          return;
        }

        const success = await switchNetwork(chainId);
        setHasBlockchainNetworkError(!success);
      };

      switchToNetwork();
    }
  }, [blockchainNetwork, walletData.isConnected]);

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
          explicitAndSensitiveContent: data.themeSwitch,
          blockchain: NETWORK_NAMES.NETWORK || "",
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

  const StoreData = async (data) => {
    try {
      const logoImagePathObject = JSON.parse(logoImagePath);
      const coverImagePathObject = JSON.parse(coverImagePath);
      const featureImagePathObject = JSON.parse(featureImagePath);

      console.log("Starting StoreData with network:", blockchainNetwork);
      const factoryContract = collectionType === "Single"
        ? await getERC721FactoryContract(blockchainNetwork)
        : await getERC1155FactoryContract(blockchainNetwork);

      if (!factoryContract) {
        throw new Error("Failed to initialize factory contract");
      }

      console.log("Factory contract initialized:", factoryContract.address);
      console.log("Current account:", walletData.account);

      // Generate a random salt for deployment
      const salt = ethers.utils.randomBytes(32);

      const collectionParams = {
        name: data.title,
        symbol: data.symbol,
        baseURI: data.baseURI || "",
        maxSupply: data.maxSupply || 0,
        royalty: data.royalty || 0,
        paymentTokens: data.paymentTokens || []
      };

      console.log("Collection parameters:", collectionParams);

      // Deploy the collection
      const deployTx = await factoryContract.deploy(
        salt,
        collectionParams.name,
        collectionParams.symbol,
        collectionParams.baseURI
      );

      console.log("Deploy transaction sent:", deployTx.hash);

      // Wait for transaction confirmation
      const receipt = await deployTx.wait();
      console.log("Transaction confirmed:", receipt.transactionHash);

      // Get the collection address from the Deployed event
      const deployedEvent = receipt.events.find(event => event.event === "Deployed");
      if (!deployedEvent) {
        throw new Error("Deployed event not found in transaction receipt");
      }

      const collectionAddress = deployedEvent.args.contractAddress;
      console.log("Collection deployed at address:", collectionAddress);
      const selectedPaymentTokensList = Array.from(selectedPaymentTokens).map(({ value }) => value);

      const slug = data.title ? data.title.toLowerCase().split(" ").join("-") : null;
      // Create collection data for Strapi
      const collectionData = {
        name: data.title ? data.title : null,
        description: data.description,
        logo: logoImagePathObject || "Null",
        logoID: Number(logoImageId),
        cover: coverImagePathObject || "Null",
        coverID: Number(coverImageId),
        featured: featureImagePathObject || "Null",
        symbol: data.symbol,
        baseURI: data.baseURI,
        maxSupply: data.maxSupply,
        royalty: data.royalty,
        paymentTokens: selectedPaymentTokensList,
        contractAddress: collectionType === 'Single' ? collectionAddress : null,
        contractAddress1155: collectionType !== 'Single' ? collectionAddress : null,
        networkType: blockchainNetwork || "Somnia",
        collectionType: collectionType,
        slug,
        category,
        ownerAddress: walletData.account,
        status: "active",
        blockchain: blockchainNetwork.toLocaleLowerCase() || "",
      };
      console.log("Collection data:", collectionData);
      // Create collection in Strapi
      console.log("collectionData ", collectionData)
      const response = await strapi.create("collections", collectionData);
      console.log("Collection created in Strapi:", response);

      if (response.data) {
        toast.success("Collection created successfully!");
        router.push("/collection");
      } else {
        throw new Error("Failed to create collection in Strapi");
      }
    } catch (error) {
      console.error("Error in StoreData:", error);
      toast.error(error.message || "Failed to create collection");
    }
  };

  const onSubmit = async (data, e) => {
    const { target } = e;
    const submitBtn = target.localName === "span" ? target.parentElement : target;
    const isPreviewBtn = submitBtn.dataset?.btn;

    /** if Wallet not connected */
    if (!walletData.isConnected) {
      let res = await checkAndConnectWallet(blockchainNetwork);
      if (!res) return;
    }

    // Validate blockchain network
    if (!blockchainNetwork) {
      toast.error("Please select a blockchain network");
      setHasBlockchainNetworkError(true);
      return;
    }

    console.log("Selected blockchain network:", blockchainNetwork);

    // Get chain ID for the selected network
    const chainId = getChainIdByNetworkName(blockchainNetwork);
    console.log("Chain ID for network:", chainId);

    if (!chainId) {
      toast.error("Invalid network selected");
      setHasBlockchainNetworkError(true);
      return;
    }

    // Switch network
    const networkChanged = await switchNetwork(chainId);
    console.log("Network switch result:", networkChanged);

    if (!networkChanged) {
      toast.error(Messages.WALLET_NETWORK_CHNAGE_FAILED);
      return;
    }

    /** Show Error if form not submitted correctly */
    setHasCatError(!category);
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    /** code for fetching submitted button value */
    if (isPreviewBtn) {
      setPreviewData({ ...data, image: data.logoImg[0] });
      setShowPreviewModal(true);
    } else {
      // Get current chain ID from wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const { chainId: currentChainId } = await provider.getNetwork();
      const currentChainIdHex = "0x" + currentChainId.toString(16);

      console.log("Current chain ID:", currentChainIdHex);
      console.log("Target chain ID:", chainId);

      // Compare chain IDs
      if (currentChainIdHex.toLowerCase() !== chainId.toLowerCase()) {
        toast.error(`Please ensure you're connected to ${blockchainNetwork} network`);
        return;
      }

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

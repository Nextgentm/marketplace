/* eslint quotes: "off" */
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
import { AppData } from "src/context/app-context";
import {
  BINANCE_NETWORK_CHAIN_ID,
  ETHEREUM_NETWORK_CHAIN_ID,
  POLYGON_NETWORK_CHAIN_ID,
  SOMNIA_NETWORK_CHAIN_ID,
  NETWORKS,
  getChainIdByNetworkName
} from "src/lib/constants";
import { getERC721Contract, getERC1155Contract, addressIsAdmin } from "src/lib/BlokchainHelperFunctions";
import { useMutation } from "@apollo/client";
// Comment out the import to avoid 401 authentication error
// import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";
import strapi from "@utils/strapi";
import { Messages, NETWORK_NAMES } from "@utils/constants";

const CreateNewArea = ({ className, space, collectible }) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState();
  const [hasImageError, setHasImageError] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [dataCollection, setDataCollection] = useState(null);
  const [blockchainNetwork, setBlockchainNetwork] = useState("Somnia");

  const { walletData,
    changeNetworkByNetworkType,
    checkAndConnectWallet
  } = useContext(AppData);
  // Comment out the useMutation hook to avoid 401 authentication error
  // const [createOwnerHistory, { data: createdOwnerHistory }] = useMutation(CREATE_OWNER_HISTORY);

  const router = useRouter();

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

  watch(["file"]);

  const notify = () => toast("Your product has submitted");
  const handleProductModal = () => {
    setShowProductModal(false);
  };
  const [selectedCollection, setSelectedCollection] = useState(null);

  const [nftImagePath, setNftImagePath] = useState("");
  const [nftImageId, setNftImageId] = useState("");

  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);

  const isAddPropertyModalHandler = () => setIsAddPropertyModalOpen((prev) => !prev);

  const selectedCollectionHandler = (item) => {
    console.log("Selected collection:", item.value);
    setSelectedCollection(item.value);

    // Check for blockchain field first, then fall back to networkType
    const networkToUse = item.value.blockchain || item.value.networkType || "Somnia";
    console.log("Setting blockchain network to:", networkToUse);
    blockchainNetworkHandler(networkToUse);
  };

  useEffect(() => {
    // console.log(nftImagePath);
    console.log("Image uploaded");
  }, [nftImagePath])

  /** Dynamic_fields */
  const [formValues, setFormValues] = useState([{ properties_name: "", properties_type: "" }]);

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
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload?id=${nftImageId}`, {
        method: "post",
        body: formUpdateImage
      })
        .then((response) => response.json())
        .then((res) => {
          setNftImagePath(JSON.stringify(res));
          setNftImageId(res?.id);
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
          setNftImagePath(JSON.stringify(res[0]));
          setNftImageId(res[0]?.id);
        });
    }
  }

  async function StoreData(data) {
    try {
      console.log("StoreData started");
      let contractAddress;
      if (router.query.type === "single") {
        contractAddress = selectedCollection.contractAddress;
      } else if (router.query.type === "multiple") {
        contractAddress = selectedCollection.contractAddress1155;
      }
      console.log("Selected collection:", selectedCollection);
      console.log("Resolved contract address:", contractAddress);

      if (!contractAddress) {
        console.error("No contract address found in the selected collection");
        toast.error("The selected collection doesn't have a valid contract address. Please select another collection.");
        return;
      }

      const metadataURL = data?.external_url ? data?.external_url : "";
      const { price, royality } = data;
      const supply = data?.supply ? Number(data?.supply) : 1;

      const { tokenID, transactionHash } = await MintNFT(contractAddress, metadataURL, price, royality, supply);
      if (!tokenID || !transactionHash) {
        console.log("MintNFT failed to return valid tokenID or transactionHash");
        return;
      }

      const nft_url_4 = JSON.parse(nftImagePath);
      const res = await strapi.create("collectibles", {
        name: data.name ? data.name : null,
        image: nft_url_4 || "ImagePath",
        imageID: nftImageId || 0,
        description: data.discription ? data.discription : null,
        price: data.price ? Number(data.price) : null,
        size: 1,
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
        collectionContractAddress: data.collectionContractAddress ? data.collectionContractAddress : null,
        putOnSale: false,
        instantSalePrice: data.instantsaleprice,
        unlockPurchased: data.unlockpurchased,
        slug: data.name ? data.name.toLowerCase().split(" ").join("-") : null,
        collection: selectedCollection.id,
        blockchain: blockchainNetwork || "",
      });
      console.log(res);
      const collectiblesId = res.data.id;

      for (let i = 0; i < formValues.length; i++) {
        if (formValues[i].properties_name && formValues[i].properties_type) {
          await strapi.create("collectible-properties", {
            name: formValues[i].properties_name,
            type: formValues[i].properties_type,
            collectibles: collectiblesId
          });
        }
      }

      // Comment out GraphQL mutation to avoid 401 authentication error
      /* 
      createOwnerHistory({
        variables: {
          data: {
            collectible: collectiblesId,
            event: "Minted",
            fromWalletAddress: "0x0000000000000000000000000000000000000000",
            quantity: supply,
            toWalletAddress: walletData.account,
            transactionHash: transactionHash
          }
        }
      });
      */

      notify();
      reset();
      setSelectedImage();
      setFormValues([]);
    } catch (error) {
      console.log(error);
    }
  }

  async function MintNFT(contractAddress, metadataURL, price, royalty, supply) {
    try {
      console.log("MintNFT starting with contractAddress:", contractAddress);

      if (!contractAddress) {
        console.error("Contract address is null or undefined");
        toast.error("Collection contract address is missing. Please select a valid collection.");
        return { tokenID: null, transactionHash: null };
      }

      if (!walletData.provider) {
        console.error("Wallet provider is not available");
        toast.error("Wallet connection issue. Please reconnect your wallet.");
        return { tokenID: null, transactionHash: null };
      }

      const signer = walletData.provider.getSigner();

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
        // Check if we have contract data loaded
        if (!walletData.contractData || !walletData.contractData.ERC721Contract) {
          console.error("ERC721 contract data not available");
          toast.error("Contract data not available. Please try again.");
          return { tokenID: null, transactionHash: null };
        }

        // Pull the deployed contract instance
        const contract721 = await getERC721Contract(walletData, contractAddress);

        if (!contract721) {
          console.error("Failed to initialize ERC721 contract");
          toast.error("Contract initialization failed. Please try again.");
          return { tokenID: null, transactionHash: null };
        }

        console.log("ERC721 contract initialized:", contract721.address);
        const options = {
          value: walletData.ethers.utils.parseEther("0.01")
        };
        const transaction = await contract721.createToken(
          metadataURL,
          (royalty * 10)
          // options
        );
        const receipt = await transaction.wait();
        // console.log(receipt);
        const transactionHash = receipt.transactionHash;
        const correctEvent = receipt.events.find((event) => event.event === "Transfer");
        const tokenID = parseInt(correctEvent.args.tokenId._hex, 16);
        console.log("tokenID is ", tokenID);
        return { tokenID, transactionHash };
      }
      if (router.query.type === "multiple") {
        // Check if we have contract data loaded
        if (!walletData.contractData || !walletData.contractData.ERC1155Contract) {
          console.error("ERC1155 contract data not available");
          toast.error("Contract data not available. Please try again.");
          return { tokenID: null, transactionHash: null };
        }

        // Pull the deployed contract instance
        const contract1155 = await getERC1155Contract(walletData, contractAddress);

        if (!contract1155) {
          console.error("Failed to initialize ERC1155 contract");
          toast.error("Contract initialization failed. Please try again.");
          return { tokenID: null, transactionHash: null };
        }

        console.log("ERC1155 contract initialized:", contract1155.address);
        const transaction = await contract1155.mint(metadataURL, (royalty * 10), supply);
        const receipt = await transaction.wait();
        // console.log(receipt);
        const transactionHash = receipt.transactionHash;
        const correctEvent = receipt.events.find((event) => event.event === "TransferSingle");
        const tokenID = parseInt(correctEvent.args.id._hex, 16);
        console.log("tokenID is ", tokenID);
        return { tokenID, transactionHash };
      }
      toast.error("Please select proper collection type");
      return { tokenID: null, transactionHash: null };
    } catch (error) {
      console.log(error);
      toast.error(`Error while creating NFT: ${error.message || 'Unknown error'}`);
      return { tokenID: null, transactionHash: null };
    }
  }

  const onSubmit = async (data, e) => {
    console.log("onSubmit started");
    const { target } = e;
    const submitBtn = target.localName === "span" ? target.parentElement : target;
    const isPreviewBtn = submitBtn.dataset?.btn;
    setHasImageError(!selectedImage);
    console.log("HasImageError set", !selectedImage);

    if (!selectedCollection) {
      console.log("No collection selected");
      toast.error("Select collection");
      return;
    }
    console.log("Selected collection:", selectedCollection);
    console.log("Current blockchain network:", blockchainNetwork);

    if (!walletData.isConnected) {
      console.log("Wallet not connected, attempting to connect");
      let res = await checkAndConnectWallet(blockchainNetwork);
      console.log("Wallet connection result:", res);
      if (!res) return;
    }

    // change network
    console.log("Attempting to change network to:", blockchainNetwork);
    let networkChanged = await changeNetworkByNetworkType(blockchainNetwork);
    console.log("Network change result:", networkChanged);

    if (!networkChanged) {
      // ethereum testnet
      console.log("Network change failed");
      toast.error(Messages.WALLET_NETWORK_CHNAGE_FAILED);
      return;
    }

    console.log("Network change successful");

    // Ensure we have the latest wallet data after network change
    console.log("Wallet data after network change:", walletData);
    if (!walletData.contractData) {
      console.log("No contract data available, forcing connection");
      await directConnect();
      console.log("Wallet data after forced reconnection:", walletData);
      if (!walletData.contractData) {
        toast.error("Failed to load contract data. Please try again.");
        return;
      }
    }

    if (isPreviewBtn && selectedImage) {
      console.log("Preview button clicked, showing preview modal");
      setPreviewData({ ...data, image: selectedImage });
      setShowProductModal(true);
    }
    if (!isPreviewBtn) {
      console.log("Submit button clicked, calling StoreData");
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
      setFormDataValues([...formDataValues, { properties_name: "", properties_type: "" }]);
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
          <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
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
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="input-box pb--20">
                    <label htmlFor="type" className="form-label">
                      Type
                    </label>
                  </div>
                </div>
              </div>

              {formDataValues?.map((element, index) => (
                <div className="row" key={index}>
                  <div className="col-md-5">
                    <div className="input-box pb--20">
                      <input
                        id={`properties_name${index}`}
                        placeholder="Name"
                        value={element.properties_name}
                        {...register(`properties_name${index}`, {
                          onChange: (e) => {
                            handleNameChange(index, e);
                          },
                          // required: "Enter properties name"
                        })}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="input-box pb--20">
                      <input
                        id={`properties_type${index}`}
                        placeholder="Type"
                        value={element.properties_type}
                        {...register(`properties_type${index}`, {
                          onChange: (e) => {
                            handleChange(index, e);
                          },
                          // required: "Enter properties type"
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-2 col-xl-2">
                    <div className="input-box">
                      <Button
                        color="primary-alta"
                        fullwidth
                        type="button"
                        data-btn="preview"
                        onClick={() => removeFormFields(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="row">
                <div className="col-md-12 col-xl-3">
                  <div className="input-box">
                    <Button color="primary-alta" fullwidth type="button" data-btn="preview" onClick={addFormFields}>
                      Add More
                    </Button>
                  </div>
                </div>
                <div className="col-md-12 col-xl-1">
                  <div className="input-box">
                    <Button color="primary" fullwidth type="button" aria-label="Close" onClick={onSave}>
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
    const collectionType = router.query.type
      ? router.query.type.charAt(0).toUpperCase() + router.query.type.slice(1)
      : null;
    console.log(`${process.env.BlOCKCHAIN}`, "seven filters")
    const filter = {
      filters: {
        blockchain: { $eq: NETWORK_NAMES.NETWORK }, // Added blockchain filter
        collectionType: {
          $eq: collectionType
        }
      }
    }
    if (collectible) {
      setDataCollection([{
        value: collectible?.collection,
        text: collectible?.collection?.data?.name
      }])
      let allCollectibleProperties = [];
      collectible?.collectibleProperties?.data.map((ele) => {
        allCollectibleProperties.push({ properties_name: ele.name, properties_type: ele.type });
      });
      setFormValues(allCollectibleProperties);

      // Set blockchain network from collectible
      if (collectible?.blockchain) {
        blockchainNetworkHandler(collectible.blockchain);
      }
    } else {
      strapi.find("collections", collectionType ? filter : null)
        .then((response) => {
          let paramCollection = null;
          const results = [];
          if (router.query.collection) {
            response.data.map((ele, i) => {
              if (router.query.collection === ele.slug) {
                paramCollection = ele;
                paramCollection.index = i;
                results.push({
                  value: {
                    ...ele,
                    networkType: ele.networkType || "Somnia",
                    blockchain: ele.blockchain || ele.networkType || "Somnia"
                  },
                  text: ele.name
                });
              }
            });
          } else {
            response.data.map((ele, i) => {
              results.push({
                value: {
                  ...ele,
                  networkType: ele.networkType || "Somnia",
                  blockchain: ele.blockchain || ele.networkType || "Somnia"
                },
                text: ele.name
              });
            });
          }
          setDataCollection(results);
          // console.log(paramCollection);
          if (paramCollection) {
            console.log("Setting selected collection:", paramCollection);
            setSelectedCollection(paramCollection);

            // Set blockchain network from the param collection
            const networkToUse = paramCollection.blockchain || paramCollection.networkType || "Somnia";
            console.log("Setting initial blockchain network to:", networkToUse);
            blockchainNetworkHandler(networkToUse);
          }
        });
    }
  }, [router.query.type]);
  // console.log(dataCollection);

  async function switchNetwork(chainId) {
    try {
      console.log("switchNetwork called with chainId:", chainId);

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
        console.log("Requesting network switch to chainId:", targetChainId);
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
    if (selectedCollection) {
      // Update blockchain network when collection changes
      blockchainNetworkHandler(selectedCollection.blockchain || "Somnia");
    }
  }, [selectedCollection]);

  // Replace the useEffect that calls changeNetworkByNetworkType
  useEffect(() => {
    if (walletData.isConnected && blockchainNetwork) {
      const switchToNetwork = async () => {
        console.log("switchToNetwork called with blockchain:", blockchainNetwork);
        const chainId = getChainIdByNetworkName(blockchainNetwork);
        console.log("Resolved chainId:", chainId);

        if (!chainId) {
          console.error("Invalid network name:", blockchainNetwork);
          return;
        }

        const result = await switchNetwork(chainId);
        console.log("switchNetwork result:", result);
      };

      switchToNetwork();
    }
  }, [blockchainNetwork, walletData.isConnected]);

  const reloadCollectibleData = async () => {
    let res = await strapi.findOne("collectibles", collectible?.id, {
      populate: "*",
    });
    // console.log(res);
    collectible = res.data;
  }

  const updateCollectible = async (data, e) => {
    try {
      if (!walletData.isConnected) {
        let res = await checkAndConnectWallet(selectedCollection.networkType);
        if (!res) return;
      }
      const validationValue = await addressIsAdmin(walletData);
      const isAuctionLive = collectible?.auction?.data.every(({ status }) => status === "Live");
      if (validationValue && !isAuctionLive) {

        const slug = data.name ? data.name.toLowerCase().split(" ").join("-") : collectible?.slug;
        let updatedCollectibleObj = {
          name: data.name ? data.name : collectible?.name,
          description: data.discription ? data.discription : collectible?.discription,
          price: data.price ? Number(data.price) : collectible?.price,
          external_url: data?.external_url ? data?.external_url : collectible?.external_url,
          properties: formValues || collectible?.collectibleProperties?.data,
          slug: slug,
          blockchain: blockchainNetwork || "",
        }
        if (nftImagePath) {
          updatedCollectibleObj.image = JSON.parse(nftImagePath);
          updatedCollectibleObj.imageID = nftImageId;
        }
        // console.log(updatedCollectibleObj);

        const resp = await strapi.update("collectibles", collectible?.id, updatedCollectibleObj);
        // console.log(resp);

        const collectiblesId = collectible?.id;
        const collectiblePropertiesLength = collectible?.collectibleProperties?.data.length;
        for (let i = 0; i < formValues.length; i++) {
          if (formValues[i].properties_name && formValues[i].properties_type) {
            if (i > (collectiblePropertiesLength - 1)) {
              //create new
              await strapi.create("collectible-properties", {
                name: formValues[i].properties_name,
                type: formValues[i].properties_type,
                collectibles: collectiblesId
              });
            } else {
              //update old
              await strapi.update("collectible-properties", collectible.collectibleProperties.data[i].id, {
                name: formValues[i].properties_name,
                type: formValues[i].properties_type,
              });
            }
          }
        }
        // loop to remove properties
        if (formValues.length < collectiblePropertiesLength) {
          for (let i = (formValues.length); i < collectiblePropertiesLength; i++) {
            //update old
            await strapi.delete("collectible-properties", collectible?.collectibleProperties?.data[i].id);
          }
        }
        toast("collectible updated successfully");
        reloadCollectibleData();
      } else {
        if (!validationValue)
          toast.error("Only admin can update collectible");
        if (isAuctionLive)
          toast.error("Please close live auctions for this NFT to edit.");

      }
    } catch (error) {
      toast.error("Error while updating collectible");
      console.log(error);
    }
  }

  // Add blockchainNetworkHandler function
  const blockchainNetworkHandler = (networkName) => {
    console.log("Selected network:", networkName);
    setBlockchainNetwork(networkName);
  };

  return (
    <>
      <div className={clsx("create-area", space === 1 && "rn-section-gapTop", className)}>
        <ShareModal
          show={isAddPropertyModalOpen}
          handleModal={isAddPropertyModalHandler}
          formValues={formValues}
          setFormValues={setFormValues}
        />
        <form action="#" onSubmit={collectible ? handleSubmit(updateCollectible) : handleSubmit(onSubmit)}>
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-3 offset-1 ml_md--0 ml_sm--0">
                <div className="upload-area">
                  <div className="upload-formate mb--30">
                    <h6 className="title">Upload file</h6>
                    <p className="formate">Drag or choose your file to upload</p>
                  </div>

                  <div className="brows-file-wrapper">
                    <input
                      name="file"
                      id="file"
                      type="file"
                      className="inputfile"
                      data-multiple-caption="{count} files selected"
                      multiple
                      {...register("file", collectible ? {
                        onChange: () => {
                          updateImage("file");
                        }
                      } : {
                        required: "Upload logo image",
                        onChange: () => {
                          updateImage("file");
                        }
                      })}
                    />
                    {(selectedImage) && (
                      <img
                        id="createfileImage"
                        src={URL.createObjectURL(selectedImage)}
                        alt=""
                        data-black-overlay="6"
                      />
                    )}
                    {(collectible?.image?.data?.url && !nftImagePath) && (
                      <img
                        id="createfileImage"
                        src={collectible?.image?.data?.url}
                        alt=""
                        data-black-overlay="6"
                      />
                    )}

                    <label htmlFor="file" title="No File Choosen">
                      <i className="feather-upload" />
                      <span className="text-center">Choose a File</span>
                      <p className="text-center mt--10">
                        PNG, GIF, WEBP, MP4 or MP3. <br /> Max 1Gb.
                      </p>
                    </label>
                  </div>
                  {hasImageError && !selectedImage && <ErrorText>Image is required</ErrorText>}
                </div>

                <div className="mt--100 mt_sm--30 mt_md--30 d-none d-lg-block">
                  {router.query?.type && <h5>Selected Variants: {router.query?.type.toUpperCase()}</h5>}
                  {/* <h5> Note: </h5>
                  <span>
                    {" "}
                    Service fee : <strong>2.5%</strong>{" "}
                  </span>{" "}
                  <br />
                  <span>
                    {" "}
                    You will receive : <strong>25.00 ETH $50,000</strong>
                  </span> */}
                </div>
              </div>
              <div className="col-lg-7">
                <div className="form-wrapper-one">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="input-box pb--20">
                        <label htmlFor="name" className="form-label">
                          Product Name
                        </label>
                        <input
                          id="name"
                          defaultValue={collectible ? collectible?.name : ""}
                          placeholder="e. g. `Digital Awesome Game`"
                          {...register("name", {
                            required: "Name is required"
                          })}
                        />
                        {errors.name && <ErrorText>{errors.name?.message}</ErrorText>}
                      </div>
                    </div>
                    {router.query?.type && (
                      <div className="col-md-6">
                        <div className="input-box pb--20">
                          <label htmlFor="type" className="form-label">
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
                        <label htmlFor="Discription" className="form-label">
                          Discription
                        </label>
                        <textarea
                          id="discription"
                          rows="3"
                          placeholder="e. g. `After purchasing the product you can get item...`"
                          {...register("discription", {
                            required: "Discription is required"
                          })}
                          defaultValue={collectible ? collectible?.description : ""}
                        />
                        {errors.discription && <ErrorText>{errors.discription?.message}</ErrorText>}
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="collection-single-wized">
                        <label htmlFor="category" className="title required">
                          Collection
                        </label>
                        <div className="create-collection-input">
                          {dataCollection && (
                            <NiceSelect
                              name="category"
                              placeholder="Select Collection"
                              options={dataCollection}
                              onChange={selectedCollectionHandler}
                              defaultCurrent={router.query?.type || collectible ? 0 : null}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="input-box pb--20">
                        <label htmlFor="Propertie" className="form-label">
                          Properties
                        </label>
                        <div className="input-box">
                          <Button color="primary-alta" onClick={addPropertyPopup}>
                            Add Properties
                          </Button>
                          {formValues?.map((element, index) => (
                            element.properties_name || element.properties_type ?
                              <span key={index}> [<b>{element.properties_name}</b>: {element.properties_type} ],</span>
                              : <></>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="input-box pb--20">
                        <label htmlFor="price" className="form-label">
                          Item Price
                        </label>
                        <input
                          id="price"
                          placeholder="e. g. `20$`"
                          type="number" step="0.0000001" min="0.000000000000000001"
                          defaultValue={collectible ? collectible?.price : ""}
                          {...register("price", {
                            pattern: {
                              // value: /^[0-9]+$/,
                              message: "Please enter a number"
                            },
                            required: "Price is required"
                          })}
                        />
                        {errors.price && <ErrorText>{errors.price?.message}</ErrorText>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="input-box pb--20">
                        <label htmlFor="Royality" className="form-label">
                          Royality
                        </label>
                        <input
                          id="royality"
                          placeholder="e. g. `20%`"
                          defaultValue={collectible ? collectible?.royalty : ""}
                          readOnly={collectible ? true : false}
                          {...register("royality", {
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "Please enter a number"
                            },
                            required: "Royality is required"
                          })}
                        />
                        {errors.royality && <ErrorText>{errors.royality?.message}</ErrorText>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="input-box pb--20">
                        <label htmlFor="External URL" className="form-label">
                          External URL
                        </label>
                        <input id="external_url" placeholder="External URL"
                          defaultValue={collectible ? collectible?.external_url : ""} {...register("externalurl")} />
                      </div>
                    </div>

                    <div className="col-md-6">
                      {router.query.type === "multiple" && (
                        <div className="input-box pb--20">
                          <label htmlFor="supply" className="form-label">
                            Supply
                          </label>
                          <input
                            id="supply"
                            placeholder="e. g. `1-100`"
                            defaultValue={collectible ? collectible?.supply : ""}
                            {...register("supply", {
                              pattern: {
                                value: /^[0-9]+$/,
                                message: "Please enter a number"
                              }
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

                    {collectible ?
                      <div className="col-lg-12">
                        <div className="button-wrapper">
                          <Button
                            type="submit"
                            color="primary-alta"
                            data-btn="update"
                            name="update"
                            value="update"
                            fullwidth
                          >
                            Update Collection
                          </Button>
                        </div>
                      </div>
                      : <>
                        <div className="col-md-12 col-xl-4">
                          <div className="input-box">
                            <Button
                              color="primary-alta"
                              fullwidth
                              type="submit"
                              data-btn="preview"
                              onClick={handleSubmit(onSubmit)}
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
                      </>}
                  </div>
                  <div className="mt--100 mt_sm--30 mt_md--30 d-block d-lg-none">
                    {/* <h5> Note: </h5>
                    <span>
                      {" "}
                      Service fee : <strong>2.5%</strong>{" "}
                    </span>{" "}
                    <br />
                    <span>
                      {" "}
                      You will receive : <strong>25.00 ETH $50,000</strong>
                    </span> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      {showProductModal && <ProductModal show={showProductModal} handleModal={handleProductModal} data={previewData} collectionName={selectedCollection.name} />}
    </>
  );
};

CreateNewArea.propTypes = {
  className: PropTypes.string,
  space: PropTypes.oneOf([1])
};

CreateNewArea.defaultProps = {
  space: 1
};

export default CreateNewArea;

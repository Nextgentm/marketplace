import PropTypes from "prop-types";
import clsx from "clsx";
import Sticky from "@ui/sticky";
import Button from "@ui/button";
import GalleryTab from "@components/product-details/gallery-tab";
import ProductTitle from "@components/product-details/title";
import ProductCategory from "@components/product-details/category";
import ProductCollection from "@components/product-details/collection";
import BidTab from "@components/product-details/bid-tab";
import PlaceBet from "@components/product-details/place-bet";
import { ImageType } from "@utils/types";
import { useEffect, useState, useContext } from "react";
import { TabContainer, TabContent, Nav, TabPane } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { AppData } from "src/context/app-context";
import { BINANCE_NETWORK_CHAIN_ID, ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import DirectSalesModal from "@components/modals/direct-sales";
import TimeAuctionModal from "@components/modals/time-auction";
import TransferPopupModal from "@components/modals/transfer";
import { getERC1155Balance, validateInputAddresses, getERC1155Contract, getERC721Contract, switchNetwork, addressIsAdmin, getTradeContract, getTokenContract, convertEthertoWei, getDateForSolidity, signMessage, getStakingNFTContract } from "../../lib/BlokchainHelperFunctions";
import { useMutation } from "@apollo/client";
import { UPDATE_COLLECTIBLE } from "src/graphql/mutation/collectible/updateCollectible";
import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";
import strapi from "@utils/strapi";
import ConfirmModal from "@components/modals/confirm-modal";
import StakingTabContent from "@components/product-details/staking-tab/staking-tab-content";
import AuctionsTabContent from "@components/product-details/bid-tab/auctions-tab-content";
import { Messages } from "@utils/constants";

// Demo Image

const ProductDetailsArea = ({ space, className, product, bids }) => {
  const [showAuctionInputModel, setShowAuctionInputModel] = useState(false);
  const [sellType, setSellType] = useState("nav-direct-sale");

  const { walletData,
    changeNetworkByNetworkType,
    checkAndConnectWallet
  } = useContext(AppData);

  const [updateCollectible, { data: updatedCollectible }] = useMutation(UPDATE_COLLECTIBLE);
  const [createOwnerHistory, { data: createdOwnerHistory }] = useMutation(CREATE_OWNER_HISTORY);

  const router = useRouter();
  const [erc1155MyBalance, setERC1155MyBalance] = useState(0);
  const [totalNFTInAuction, setTotalNFTInAuction] = useState(0);
  const [totalStakeNFT, setTotalStakeNFT] = useState(0);
  const [showDirectSalesModal, setShowDirectSalesModal] = useState(false);
  const handleDirectSaleModal = () => {
    setShowAuctionInputModel(!showDirectSalesModal); // close model close on sale buttons option
    setShowDirectSalesModal((prev) => !prev);
  };

  const [showTimeAuctionModal, setShowTimeAuctionModal] = useState(false);
  const handleTimeAuctionModal = () => {
    setShowAuctionInputModel(!showTimeAuctionModal); // close model close on sale buttons option
    setShowTimeAuctionModal((prev) => !prev);
  };

  const [showTransferModal, setShowTransferModal] = useState(false);
  const handleShowTransferModal = () => {
    setShowTransferModal((prev) => !prev);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const handleShowConfirmModal = () => {
    setShowConfirmModal((prev) => !prev);
  };

  const [showStakingConfirmModal, setShowStakingConfirmModal] = useState(false);
  const handleShowStakingConfirmModal = () => {
    setShowStakingConfirmModal((prev) => !prev);
  };

  const [isAdminWallet, setIsAdminWallet] = useState(false);

  const [descriptionShowMore, setDescriptionShowMore] = useState(false);

  const [stakingData, setStakingData] = useState([]);

  useEffect(() => {
    if (walletData.isConnected) {
      addressIsAdmin(walletData).then((validationValue) => {
        setIsAdminWallet(validationValue);
      }).catch((error) => { console.log("Error while factory call " + error) });
    } else {
      setIsAdminWallet(false);
    }
  }, [walletData]);

  useEffect(() => {
    // if (updatedCollectible) {
    // console.log(updatedCollectible);
    // }
    // console.log(updatedCollectible);
  }, [updatedCollectible]);

  useEffect(() => {
    if (createdOwnerHistory) {
      // local product values update
      // later update this product to hook
      product?.owner_histories?.data.push({
        createdAt: createdOwnerHistory.createOwnerHistory.data?.attributes?.createdAt,
        event: createdOwnerHistory.createOwnerHistory.data?.attributes?.event,
        fromWalletAddress: createdOwnerHistory.createOwnerHistory.data?.attributes?.fromWalletAddress,
        id: createdOwnerHistory.createOwnerHistory.data?.id,
        quantity: createdOwnerHistory.createOwnerHistory.data?.attributes?.quantity,
        toWalletAddress: createdOwnerHistory.createOwnerHistory.data?.attributes?.toWalletAddress,
        transactionHash: createdOwnerHistory.createOwnerHistory.data?.attributes?.transactionHash
      });
    }
    // console.log(createdOwnerHistory);
  }, [createdOwnerHistory]);

  const getStakingData = async () => {
    if (walletData.isConnected) {
      if (walletData.account) {
        let _stakingData = await strapi.find("collectible-stakings", {
          filters: {
            collectible: product.id,
            walletAddress: walletData.account,
            isClaimed: false
          }
        });
        // console.log(_stakingData);
        setStakingData(_stakingData.data);
        let total = 0;
        _stakingData.data.map((stake) => {
          if (stake.walletAddress == walletData.account)
            total += stake.stakingAmount;
        })
        setTotalStakeNFT(total);
      }
    }
  }

  const updateMyERC1155Balance = () => {
    if (walletData.isConnected) {
      if (walletData.account) {
        if (product.collection.data.collectionType === "Multiple") {
          // check ERC1155 Token balance
          const contractAddress = product.collection.data.contractAddress1155;
          getERC1155Balance(walletData, walletData.account, contractAddress, product.nftID).then((balance) => {
            setERC1155MyBalance(balance);
          }).catch((error) => { console.log("Error while factory call " + error) });
          // total count of nft in auction by user
          let total = 0;
          product.auction?.data.map((auction) => {
            if (auction.walletAddress == walletData.account && auction.status == "Live")
              total += auction.remainingQuantity;
          })
          setTotalNFTInAuction(total);
        }
      } else {
        setERC1155MyBalance(0);
      }
    } else {
      setERC1155MyBalance(0);
      // toast.error("Please connect wallet first");
    }
  }

  useEffect(() => {
    updateMyERC1155Balance();
    getStakingData();
  }, [walletData])

  async function approveNFT() {
    try {
      let contractAddress;
      if (product.collection.data.collectionType === "Single") {
        contractAddress = product.collection.data.contractAddress;
        // console.log(contractAddress);

        // Pull the deployed contract instance
        const contract721 = await getERC721Contract(walletData, contractAddress);
        // const options = {
        //     value: walletData.ethers.utils.parseEther("0.01"),
        // };
        let approveAddress = await contract721.getApproved(product.nftID);
        const approved = await contract721.isApprovedForAll(walletData.account, walletData.contractData.TransferProxy.address);
        // console.log(approved);
        // console.log(approveAddress);
        if (approveAddress.toLowerCase() != walletData.contractData.TransferProxy.address.toLowerCase() && !approved) {
          // approve nft first
          // const transaction = await contract721.approve(walletData.contractData.TransferProxy.address, product.nftID);
          const transaction = await contract721.setApprovalForAll(walletData.contractData.TransferProxy.address, true);
          const receipt = await transaction.wait();
          // console.log(receipt);
        }
      } else if (product.collection.data.collectionType === "Multiple") {
        contractAddress = product.collection.data.contractAddress1155;
        // Pull the deployed contract instance
        const contract1155 = await getERC1155Contract(walletData, contractAddress);

        const approved = await contract1155.isApprovedForAll(walletData.account, walletData.contractData.TransferProxy.address);
        // console.log(approved);
        if (!approved) {
          const transaction = await contract1155.setApprovalForAll(walletData.contractData.TransferProxy.address, true);
          const receipt = await transaction.wait();
        }
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getOrderSellerHash(data) {
    try {
      let contractAddress, nftType;
      if (product.collection.data.collectionType === "Single") {
        contractAddress = product.collection.data.contractAddress;
        nftType = 1;
      } else if (product.collection.data.collectionType === "Multiple") {
        contractAddress = product.collection.data.contractAddress1155;
        nftType = 0;
      }
      let paymentToken = product.collection?.data?.paymentTokens?.data.find(token => token.id == data.paymentToken);
      // console.log(paymentToken);
      let TokenContractAddress;
      //Select token contract address according to current network
      if (walletData.network == "Polygon") {
        TokenContractAddress = paymentToken?.polygonAddress;
      } else if (walletData.network == "Ethereum") {
        TokenContractAddress = paymentToken?.ethAddress;
      } else if (walletData.network == "Binance") {
        TokenContractAddress = paymentToken?.binanceAddress;
      }
      if (!TokenContractAddress) {
        toast.error("Token address not found for current network!");
        return;
      }
      const tokenContract = await getTokenContract(walletData, TokenContractAddress);
      // const allowance = await tokenContract.allowance(walletData.account, walletData.contractData.TransferProxy.address);
      // const allowanceAmount = parseInt(allowance._hex, 16);
      const decimals = await tokenContract.decimals();
      //convert price
      let convertedPrice;
      if (decimals == 18) {
        convertedPrice = convertEthertoWei(walletData.ethers, data.price);
      } else {
        convertedPrice = (data.price * (10 ** decimals));
      }
      const tradeContract = await getTradeContract(walletData);

      const orderSellerHash = await tradeContract.getOrderSellerHash([
        walletData.account, // seller
        walletData.account, // buyer (skip)
        TokenContractAddress, // erc20Address
        contractAddress, // NFT contractAddress
        nftType, // nftType
        convertedPrice, // unit price
        data.quantity ? data.quantity : 1, // total onsale quantity
        false, // skip royalty
        getDateForSolidity(data.startTimestamp),
        getDateForSolidity(data.endTimeStamp),
        product.nftID, // tokenID
        convertedPrice, // total price (skip)
        1, // total purchase quantity (skip)
        "0x", // seller signaure (skip)
        "0x" // buyer signaure (skip)
      ]);
      console.log(orderSellerHash);
      return orderSellerHash;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function StoreData(data) {
    try {
      if (!(await approveNFT())) {
        return;
      }
      const sellerHash = await getOrderSellerHash(data);
      const sellerOrderSignature = await signMessage(walletData.provider, walletData.account, sellerHash);
      // console.log(sellerOrderSignature);
      if (!sellerOrderSignature) {
        return;
      }
      // update auction to complete
      const res = await strapi.create("auctions", {
        walletAddress: walletData.account,
        bidPrice: data.price,
        priceCurrency: data.currency,
        sellType: data.sellType,
        status: "Live",
        startTimestamp: data.startTimestamp,
        endTimeStamp: data.endTimeStamp,
        collectible: product.id,
        paymentToken: data.paymentToken,
        quantity: data.quantity ? data.quantity : 1,
        remainingQuantity: data.quantity ? data.quantity : 1,
        signature: sellerOrderSignature
      });
      // console.log(res);
      const data = await strapi.update("collectibles", product.id, {
        putOnSale: true
      });
      toast.success("Auction created successfully");
      setShowAuctionInputModel(false);
      router.push(`/collectible/${product.slug}/auction/${res.data.id}`);
    } catch (error) {
      toast.error("Error while creating auction");
      console.log(error);
    }
  }

  const handleSubmit = async (event) => {
    // const { target } = e;
    event.preventDefault();
    // console.log(event);
    // console.log(product);
    if (!walletData.isConnected) {
      let res = await checkAndConnectWallet(product.collection.data.networkType);
      if (!res) return;
    }
    // chnage network
    let networkChanged = await changeNetworkByNetworkType(product.collection.data.networkType);
    if (!networkChanged) {
      // ethereum testnet
      toast.error(Messages.WALLET_NETWORK_CHNAGE_FAILED);
      return;
    }

    let _sellType;
    if (sellType == "nav-direct-sale") {
      _sellType = "FixedPrice";
    } else if (sellType == "nav-timed-auction") {
      _sellType = "Bidding";
    }
    const data = {
      price: event.target.price.value,
      startTimestamp: event.target.startDate.value,
      endTimeStamp: event.target.endDate.value,
      sellType: _sellType,
      paymentToken: event.target.paymentToken.value,
      currency: event.target.paymentToken?.options[event.target?.paymentToken?.selectedIndex]?.text ? event.target.paymentToken.options[event.target.paymentToken.selectedIndex].text : event.target.currency.value,
      quantity: event.target.quantity?.value ? event.target.quantity?.value : 1
    };
    // console.log(data);
    StoreData(data);
  };

  const handleSubmitTransfer = async (event) => {
    // const { target } = e;
    event.preventDefault();
    // console.log(event);
    // console.log(product);
    if (!walletData.isConnected) {
      let res = await checkAndConnectWallet(product.collection.data.networkType);
      if (!res) return;
    }
    // chnage network
    let networkChanged = await changeNetworkByNetworkType(product.collection.data.networkType);
    if (!networkChanged) {
      // ethereum testnet
      toast.error(Messages.WALLET_NETWORK_CHNAGE_FAILED);
      return;
    }
    // transfer NFT to other user
    const receiver = event.target.receiver.value;
    const quantity = event.target.quantity?.value ? event.target.quantity?.value : 1;
    // console.log(receiver);
    try {
      if (validateInputAddresses(receiver)) {
        // console.log("valid address");

        const signer = walletData.provider.getSigner();
        let transactionHash = null;
        if (product.collection.data.collectionType === "Single") {
          const contractAddress = product.collection.data.contractAddress;
          // console.log(contractAddress);

          // Pull the deployed contract instance
          const contract721 = await getERC721Contract(walletData, contractAddress);

          // approve nft first
          const transaction = await contract721.transferFrom(walletData.account, receiver, product.nftID);
          const receipt = await transaction.wait();
          // console.log(receipt);
          transactionHash = receipt.transactionHash;
        } else if (product.collection.data.collectionType === "Multiple") {
          const contractAddress = product.collection.data.contractAddress1155;
          // Pull the deployed contract instance
          const contract1155 = await getERC1155Contract(walletData, contractAddress);

          // transfer token
          const transaction = await contract1155.safeTransferFrom(
            walletData.account,
            receiver,
            product.nftID,
            quantity,
            []
          );
          const receipt = await transaction.wait();
          console.log(receipt);
          transactionHash = receipt.transactionHash;
        }
        const data = await strapi.update("collectibles", product.id, {
          "owner": receiver.toLowerCase()
        });
        await createOwnerHistory({
          variables: {
            data: {
              collectible: product.id,
              event: "Transferred",
              fromWalletAddress: walletData.account,
              quantity: quantity,
              toWalletAddress: receiver.toLowerCase(),
              transactionHash: transactionHash
            }
          }
        });

        toast.success("NFT transfered succesfully");
        // router.reload();
        // later update this product to hook
        product.owner = receiver.toLowerCase();
        updateMyERC1155Balance();
        setShowTransferModal(false);
      } else {
        toast.error("Invalid address");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitBurnNFT = async (event) => {
    // const { target } = e;
    event.preventDefault();
    // console.log(event);
    // console.log(product);
    if (!walletData.isConnected) {
      let res = await checkAndConnectWallet(product.collection.data.networkType);
      if (!res) return;
    }
    // chnage network
    let networkChanged = await changeNetworkByNetworkType(product.collection.data.networkType);
    if (!networkChanged) {
      // ethereum testnet
      toast.error(Messages.WALLET_NETWORK_CHNAGE_FAILED);
      return;
    }
    // NFT quantity to burn
    const quantity = event.target.quantity?.value ? event.target.quantity?.value : 1;
    // console.log(quantity);
    try {
      if (quantity) {

        const signer = walletData.provider.getSigner();
        let transactionHash = null;
        if (product.collection.data.collectionType === "Single") {
          const contractAddress = product.collection.data.contractAddress;
          // console.log(contractAddress);

          // Pull the deployed contract instance
          const contract721 = await getERC721Contract(walletData, contractAddress);

          // approve nft first
          const transaction = await contract721.burn(product.nftID);
          const receipt = await transaction.wait();
          // console.log(receipt);
          transactionHash = receipt.transactionHash;
        } else if (product.collection.data.collectionType === "Multiple") {
          const contractAddress = product.collection.data.contractAddress1155;
          // Pull the deployed contract instance
          const contract1155 = await getERC1155Contract(walletData, contractAddress);

          // transfer token
          const transaction = await contract1155.burn(
            walletData.account,
            product.nftID,
            quantity
          );
          const receipt = await transaction.wait();
          console.log(receipt);
          transactionHash = receipt.transactionHash;
        }
        const data = await strapi.update("collectibles", product.id, {
          "owner": "",
          "supply": product.supply - quantity,
        });
        await createOwnerHistory({
          variables: {
            data: {
              collectible: product.id,
              event: "Burn",
              fromWalletAddress: walletData.account,
              quantity: quantity,
              toWalletAddress: "0x0000000000000000000000000000000000000000",
              transactionHash: transactionHash
            }
          }
        });

        toast.success("NFT burn succesfully");
        // router.reload();
        // later update this product to hook
        product.owner = "";
        product.supply = product.supply - quantity;
        updateMyERC1155Balance();
        setShowConfirmModal(false);
      } else {
        toast.error("Invalid Quantity");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitStakeNFT = async (event) => {
    // const { target } = e;
    event.preventDefault();
    // console.log(event);
    // console.log(product);
    if (!walletData.isConnected) {
      let res = await checkAndConnectWallet(product.collection.data.networkType);
      if (!res) return;
    }
    // chnage network
    let networkChanged = await changeNetworkByNetworkType(product.collection.data.networkType);
    if (!networkChanged) {
      // ethereum testnet
      toast.error(Messages.WALLET_NETWORK_CHNAGE_FAILED);
      return;
    }
    // NFT quantity to burn
    const quantity = event.target.quantity?.value ? event.target.quantity?.value : 1;
    // console.log(quantity);
    try {
      if (quantity) {
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
          const approved = await contract721.isApprovedForAll(walletData.account, walletData.contractData.StakingContract.address);
          // console.log(approved);
          // approve nft first
          if (approveAddress.toLowerCase() != walletData.contractData.StakingContract.address.toLowerCase() && !approved) {
            // approve nft first
            // const transaction = await contract721.approve(walletData.contractData.StakingContract.address, product.nftID);
            const transaction = await contract721.setApprovalForAll(walletData.contractData.StakingContract.address, true);
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

          const transaction = await stakingNFT.stakeToken(contractAddress, product.nftID, quantity, 0);
          const receipt = await transaction.wait();

          const correctEvent = receipt.events.find((event) => event.event === "TokensStaked");
          console.log("correctEvent is ", correctEvent);
          index = parseInt(correctEvent.args.index._hex, 16);
          console.log("index is ", index);
        }

        // create auction to complete
        const res = await strapi.create("collectible-stakings", {
          walletAddress: walletData.account,
          collectible: product.id,
          stakingAmount: quantity,
          stakingStartTime: new Date(),
          stakingEndTime: new Date(new Date().getTime() + 1000 * stakeDuration),
          rewardAmount: 0,
          restakingCount: 0,
          rewardType: "Crypto",
          isClaimed: false,
          index: index
        });
        // console.log(res);

        await getStakingData();
        toast.success("NFT stake succesful");
        // router.reload();
        // later update this product to hook
        setShowConfirmModal(false);
        setShowStakingConfirmModal(false);
      } else {
        toast.error("Invalid Quantity");
      }
    } catch (error) {
      if (error.message.includes("execution reverted:")) {
        // Extract the error message
        const startIndex = error.message.indexOf("execution reverted:");
        const endIndex = error.message.indexOf('",', startIndex);
        const extractedErrorMessage = (startIndex !== -1 && endIndex !== -1) ? error.message.substring(startIndex + 20, endIndex).trim() : null;
        if (extractedErrorMessage) {
          toast.error(`Error: ${extractedErrorMessage}`);
        } else {
          toast.error("Error while stake this NFT");
        }
      } else {
        toast.error("Error while stake this NFT");
        console.log(error);
      }
    }
  };

  return (
    <div className={clsx("product-details-area", space === 1 && "rn-section-gapTop", className)}>
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-7 col-md-12 col-sm-12">
            <Sticky>
              <GalleryTab images={[product?.image.data ? product?.image : { data: { id: "image_url", url: product?.image_url, alternativeText: "Image URL" } }, product?.front_image_url ? { data: { id: "front_image_url", url: product?.front_image_url, alternativeText: "Front Image" } } : null, product?.back_image_url ? { data: { id: "back_image_url", url: product?.back_image_url, alternativeText: "Back Image" } } : null]} />
            </Sticky>
          </div>
          <div className="col-lg-5 col-md-12 col-sm-12 mt_md--50 mt_sm--60">
            <div className="rn-pd-content-area">
              <ProductTitle title={product?.name || "Untitled NFT"} likeCount={product?.size} />
              <span className="bid">
                Price{" "}
                <span className="price">
                  {product.price}{" "}
                  {product.symbol}
                </span>
              </span>
              <h6 className="title-name" style={{ fontFamily: "inherit" }}>
                <span>{descriptionShowMore ? product.description : `${product.description.substring(0, 110)}`}</span>
                {product.description.length > 110 && <a href="#" onClick={() => descriptionShowMore ? setDescriptionShowMore(false) : setDescriptionShowMore(true)}>{descriptionShowMore ? <><br />show less</> : <>...show more</>}</a>}
              </h6>
              <div className="catagory-collection">
                <ProductCategory owner={product.collection} royalty={product.royalty} />
                <ProductCollection collection={product.collection} />
              </div>
              {product.isOpenseaCollectible ?
                <div>
                  <Button path={product.marketURL} target="_blank">View NFT</Button>
                </div> :
                showAuctionInputModel ? (
                  <div className="rn-bid-details">
                    <TabContainer defaultActiveKey="nav-direct-sale1">
                      <div className={clsx("tab-wrapper-one", className)}>
                        <nav className="tab-button-one">
                          <Nav as="div" className="nav-tabs">
                            <Nav.Link
                              as="button"
                              eventKey="nav-direct-sale"
                              onClick={() => {
                                setSellType("nav-direct-sale");
                                handleDirectSaleModal(true);
                              }}
                            >
                              Direct Sale
                            </Nav.Link>
                            <Nav.Link
                              as="button"
                              eventKey="nav-timed-auction"
                              onClick={() => {
                                setSellType("nav-timed-auction");
                                handleTimeAuctionModal(true);
                              }}
                            >
                              Timed Auction
                            </Nav.Link>
                          </Nav>
                        </nav>
                      </div>
                    </TabContainer>
                  </div>
                ) : (
                  <>
                    {((!product.putOnSale && product.owner === walletData.account && walletData.isConnected && product.supply == 1) ||
                      (product.supply > 1 && erc1155MyBalance > totalNFTInAuction && walletData.isConnected)) && (
                        <>
                          <div className="row">
                            <div className="col-md-6">
                              <Button
                                color="primary-alta" fullwidth
                                onClick={() =>
                                  product.collection.data.collectionType === "Multiple"
                                    ? setShowDirectSalesModal(true)
                                    : setShowAuctionInputModel(true)
                                }
                              >
                                Put on Sale
                              </Button>
                            </div>
                            <div className="col-md-6">
                              <Button color="primary-alta" fullwidth onClick={() => handleShowTransferModal(true)}>
                                Transfer
                              </Button>
                            </div>
                          </div>

                          {isAdminWallet &&
                            <div className="row">
                              <div className="col-md-12">
                                <br />
                                <Button color="primary-alta" fullwidth onClick={() => setShowConfirmModal(true)}>
                                  Burn NFT
                                </Button>
                              </div>
                            </div>}

                          {(product.collection.data.collectionType === "Multiple" ? (totalStakeNFT + totalNFTInAuction) < erc1155MyBalance : totalStakeNFT < 1)
                            && process.env.NEXT_PUBLIC_SENTRY_ENV !== "production" &&
                            <div className="row">
                              <span>Stake Duration: 6 min</span>
                              <span>Stake Reward: 0.0000000000000001 WETH (MaticWETH)</span>
                              <div className="col-md-12">
                                <br />
                                <Button color="primary-alta" fullwidth onClick={() => setShowStakingConfirmModal(true)}>
                                  Stake Collectible
                                </Button>
                              </div>
                            </div>
                          }
                          {stakingData.length > 0 && process.env.NEXT_PUBLIC_SENTRY_ENV !== "production" &&
                            <StakingTabContent stakingData={stakingData} product={product} refreshPageData={getStakingData} />
                          }

                        </>
                      )}

                    <div className="rn-bid-details">
                      <BidTab
                        // bids={product.putOnSale && product.auction.data[0].sellType == "Bidding" ? bids : null}
                        owner={product?.owner}
                        product={product}
                        supply={product.supply}
                        // auction={{ data: product.auction?.data[0] }}
                        // allAuctions={product.auction.data}
                        properties={product?.collectibleProperties?.data}
                        tags={product?.tags}
                        history={product?.owner_histories?.data}
                        erc1155MyBalance={erc1155MyBalance}
                      />

                      <TabContainer defaultActiveKey={"nav-auctions"}>
                        <nav className="tab-button-one">
                          <Nav as="div" className="nav-tabs">
                            {product.auction.data?.length > 0 &&
                              <Nav.Link as="button" eventKey="nav-auctions">
                                Live Sale
                              </Nav.Link>
                            }
                          </Nav>
                        </nav>
                        <TabContent className="">
                          {product.auction.data?.length > 0 &&
                            <TabPane eventKey="nav-auctions">
                              <AuctionsTabContent auctions={product.auction.data} productSlug={product.slug} />
                            </TabPane>
                          }
                        </TabContent>
                      </TabContainer>
                      {/* {product.putOnSale && (
                      <PlaceBet
                        highest_bid={{
                          amount: product.auction?.data[0]?.bidPrice,
                          priceCurrency: product.auction?.data[0]?.priceCurrency,
                          quantity: product.auction?.data[0]?.quantity
                        }}
                        auction_date={product.auction?.data[0]?.endTimeStamp}
                        product={product}
                        auction={{ data: product.auction?.data[0] }}
                        isOwner={product.auction?.data[0]?.walletAddress == walletData.account}
                      />
                    )} */}
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
      <DirectSalesModal
        show={showDirectSalesModal}
        handleModal={handleDirectSaleModal}
        supply={product?.supply}
        maxQuantity={product?.supply > 1 ? erc1155MyBalance : product?.supply}
        handleSubmit={handleSubmit}
        paymentTokensList={product.collection?.data?.paymentTokens?.data}
      />
      <TimeAuctionModal
        show={showTimeAuctionModal}
        handleModal={handleTimeAuctionModal}
        supply={product?.supply}
        maxQuantity={product?.supply > 1 ? erc1155MyBalance : product?.supply}
        handleSubmit={handleSubmit}
        paymentTokensList={product.collection?.data?.paymentTokens?.data}
      />
      <TransferPopupModal
        show={showTransferModal}
        handleModal={handleShowTransferModal}
        supply={product?.supply}
        maxQuantity={product?.supply > 1 ? erc1155MyBalance : product?.supply}
        handleSubmit={handleSubmitTransfer}
      />
      <ConfirmModal
        show={showConfirmModal}
        handleModal={handleShowConfirmModal}
        headingText={"Do you really want to burn this NFT?"}
        handleSubmit={handleSubmitBurnNFT}
        supply={product?.supply}
        maxQuantity={product?.supply > 1 ? erc1155MyBalance : product?.supply}
      />
      <ConfirmModal
        show={showStakingConfirmModal}
        handleModal={handleShowStakingConfirmModal}
        headingText={"Do you really want to stake this NFT?"}
        handleSubmit={handleSubmitStakeNFT}
        supply={product?.supply}
        maxQuantity={product?.supply > 1 ? erc1155MyBalance : product?.supply}
      />
    </div>
  );
};

ProductDetailsArea.propTypes = {
  space: PropTypes.oneOf([1, 2]),
  className: PropTypes.string,
  product: PropTypes.shape({
    __typename: PropTypes.string,
    attributes: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      likeCount: PropTypes.number,
      price: PropTypes.shape({
        amount: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired
      }).isRequired,
      owner: PropTypes.shape({}),
      collection: PropTypes.shape({}),
      properties: PropTypes.arrayOf(PropTypes.shape({})),
      tags: PropTypes.arrayOf(PropTypes.shape({})),
      history: PropTypes.arrayOf(PropTypes.shape({})),
      highest_bid: PropTypes.shape({}),
      auction_date: PropTypes.string,
      images: PropTypes.arrayOf(ImageType)
    }),
  }).isRequired,

  bids: PropTypes.arrayOf(PropTypes.shape({}))
};

ProductDetailsArea.defaultProps = {
  space: 1
};

export default ProductDetailsArea;

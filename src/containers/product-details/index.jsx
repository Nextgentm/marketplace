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
import { ETHEREUM_NETWORK_CHAIN_ID, POLYGON_NETWORK_CHAIN_ID } from "src/lib/constants";
import DirectSalesModal from "@components/modals/direct-sales";
import TimeAuctionModal from "@components/modals/time-auction";
import TransferPopupModal from "@components/modals/transfer";

import ERC721Contract from "../../contracts/json/erc721.json";
import ERC1155Contract from "../../contracts/json/erc1155.json";
import TradeContract from "../../contracts/json/trade.json";
import TransferProxy from "../../contracts/json/TransferProxy.json";
import { useMutation } from "@apollo/client";
import { UPDATE_COLLECTIBLE } from "src/graphql/mutation/collectible/updateCollectible";
import { CREATE_OWNER_HISTORY } from "src/graphql/mutation/ownerHistory/ownerHistory";

// Demo Image

const ProductDetailsArea = ({ space, className, product, bids }) => {
  const [showAuctionInputModel, setShowAuctionInputModel] = useState(false);
  const [sellType, setSellType] = useState("nav-direct-sale");

  const { walletData, setWalletData } = useContext(AppData);

  const [updateCollectible, { data: updatedCollectible }] = useMutation(UPDATE_COLLECTIBLE);
  const [createOwnerHistory, { data: createdOwnerHistory }] = useMutation(CREATE_OWNER_HISTORY);

  const router = useRouter();
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

  useEffect(() => {
    // if (updatedCollectible) {
    //   console.log(updatedCollectible);
    // }
    // console.log(updatedCollectible);
  }, [updatedCollectible]);

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

  async function approveNFT() {
    try {
      const signer = walletData.provider.getSigner();
      let contractAddress;
      if (product.collection.data.collectionType === "Single") {
        contractAddress = product.collection.data.contractAddress;
        // console.log(contractAddress);

        // Pull the deployed contract instance
        const contract721 = new walletData.ethers.Contract(contractAddress, ERC721Contract.abi, signer);
        // const options = {
        //     value: walletData.ethers.utils.parseEther("0.01"),
        // };
        let approveAddress = await contract721.getApproved(product.nftID);
        // console.log(approveAddress);
        if (approveAddress.toLowerCase() != TradeContract.address.toLowerCase()) {
          // approve nft first
          const transaction = await contract721.approve(TradeContract.address, product.nftID);
          const receipt = await transaction.wait();
          // console.log(receipt);
        }
        approveAddress = await contract721.getApproved(product.nftID);
        // console.log(approveAddress);
        if (approveAddress.toLowerCase() != TransferProxy.address.toLowerCase()) {
          // approve nft first
          const transaction = await contract721.approve(TransferProxy.address, product.nftID);
          const receipt = await transaction.wait();
          // console.log(receipt);
        }
      } else if (product.collection.data.collectionType === "Multiple") {
        contractAddress = product.collection.data.contractAddress1155;
        // Pull the deployed contract instance
        const contract1155 = new walletData.ethers.Contract(contractAddress, ERC1155Contract.abi, signer);
        // commented the timed auction part for erc1155 token
        // if (sellType === "nav-direct-sale") {
        // approval for fixed price
        const transaction = await contract1155.setApprovalForAll(TradeContract.address, true);
        const receipt = await transaction.wait();
        // console.log(receipt);
        // } else if (sellType === "nav-timed-auction") {
        //   // approval for timed auction
        //   const transaction = await contract1155.setApprovalForAll(TransferProxy.address, true);
        //   const receipt = await transaction.wait();
        //   // console.log(receipt);
        // }
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function StoreData(data) {
    try {
      if (!(await approveNFT())) {
        return;
      }
      // update auction to complete
      const res = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auctions`, {
        data: {
          walletAddress: walletData.account,
          bidPrice: data.price,
          priceCurrency: data.currency,
          sellType: data.sellType,
          startTimestamp: data.startTimestamp,
          endTimeStamp: data.endTimeStamp,
          collectible: product.id,
          paymentToken: data.paymentToken,
          quantity: data.quantity ? data.quantity : 1
        }
      });
      console.log(res);
      // update collectible putOnSale, saleType to true
      // const response = await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/${product.id}`, {
      //   data: {
      //     putOnSale: true
      //     // saleType: data.sellType,
      //   }
      // });
      updateCollectible({
        variables: {
          "data": {
            putOnSale: true
          },
          "updateCollectibleId": product.id
        }
      });
      toast.success("Auction created successfully");
      setShowAuctionInputModel(false);
      router.reload();
    } catch (error) {
      toast.error("Error while creating auction");
      console.log(error);
    }
  }

  const handleSubmit = (event) => {
    // const { target } = e;
    event.preventDefault();
    // console.log(event);
    // console.log(product);
    if (!walletData.isConnected) {
      toast.error("Please connect wallet first");
      return;
    } // chnage network
    if (product.collection.data.networkType === "Ethereum") {
      if (!switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
        // ethereum testnet
        return;
      }
    } else if (product.collection.data.networkType === "Polygon") {
      if (!switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
        // polygon testnet
        return;
      }
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
      currency: event.target.currency.value,
      quantity: event.target.quantity?.value ? event.target.quantity?.value : 1
    };
    console.log(data);
    StoreData(data);
  };

  const handleSubmitTransfer = async (event) => {
    // const { target } = e;
    event.preventDefault();
    // console.log(event);
    // console.log(product);
    if (!walletData.isConnected) {
      toast.error("Please connect wallet first");
      return;
    } // chnage network
    if (product.collection.data.networkType === "Ethereum") {
      if (!switchNetwork(ETHEREUM_NETWORK_CHAIN_ID)) {
        // ethereum testnet
        return;
      }
    } else if (product.collection.data.networkType === "Polygon") {
      if (!switchNetwork(POLYGON_NETWORK_CHAIN_ID)) {
        // polygon testnet
        return;
      }
    }
    // transfer NFT to other user
    const receiver = event.target.receiver.value;
    // console.log(receiver);
    try {
      if (walletData.ethers.utils.isAddress(receiver)) {
        // console.log("valid address");

        const signer = walletData.provider.getSigner();
        let transactionHash = null;
        if (product.collection.data.collectionType === "Single") {
          const contractAddress = product.collection.data.contractAddress;
          // console.log(contractAddress);

          // Pull the deployed contract instance
          const contract721 = new walletData.ethers.Contract(contractAddress, ERC721Contract.abi, signer);

          // approve nft first
          const transaction = await contract721.transferFrom(walletData.account, receiver, product.nftID);
          const receipt = await transaction.wait();
          // console.log(receipt);
          transactionHash = receipt.transactionHash;
        } else if (product.collection.data.collectionType === "Multiple") {
          const contractAddress = product.collection.data.contractAddress1155;
          // Pull the deployed contract instance
          const contract1155 = new walletData.ethers.Contract(contractAddress, ERC1155Contract.abi, signer);

          // transfer token
          const transaction = await contract1155.safeTransferFrom(
            walletData.account,
            receiver,
            product.nftID,
            product.supply,
            []
          );
          const receipt = await transaction.wait();
          console.log(receipt);
          transactionHash = receipt.transactionHash;
        }

        // update collectible putOnSale, saleType to true
        // const response = await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/${product.id}`, {
        //   data: {
        //     owner: receiver.toLowerCase()
        //   }
        // });
        // console.log(response);
        updateCollectible({
          variables: {
            "data": {
              "owner": receiver.toLowerCase()
            },
            "updateCollectibleId": product.id
          }
        });

        // create owner history for Transfer
        // const response2 = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/owner-histories`, {
        //   data: {
        //     event: "Transferred",
        //     toWalletAddress: receiver.toLowerCase(),
        //     transactionHash: transactionHash,
        //     quantity: product.supply,
        //     fromWalletAddress: walletData.account,
        //     collectible: product.id
        //   }
        // });
        createOwnerHistory({
          variables: {
            data: {
              collectible: product.id,
              event: "Transferred",
              fromWalletAddress: walletData.account,
              quantity: product.supply,
              toWalletAddress: receiver.toLowerCase(),
              transactionHash: transactionHash
            }
          }
        });

        toast.success("NFT transfered succesfully");
        router.reload();
        setShowTransferModal(false);
      } else {
        toast.error("Invalid address");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={clsx("product-details-area", space === 1 && "rn-section-gapTop", className)}>
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-7 col-md-12 col-sm-12">
            <Sticky>
              <GalleryTab images={product?.image} />
            </Sticky>
          </div>
          <div className="col-lg-5 col-md-12 col-sm-12 mt_md--50 mt_sm--60">
            <div className="rn-pd-content-area">
              <ProductTitle title={product?.name || "Untitled NFT"} likeCount={product?.size} />
              <span className="bid">
                Price{" "}
                <span className="price">
                  {product.price}
                  {product.symbol}
                </span>
              </span>
              <h6 className="title-name">{`${product.description.substring(0, 110)}...`}</h6>
              <div className="catagory-collection">
                <ProductCategory owner={product.collection} royalty={product.royalty} />
                <ProductCollection collection={product.collection} />
              </div>
              {showAuctionInputModel ? (
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
                  {!product.putOnSale && product.owner === walletData.account && (
                    <div className="row">
                      <div className="col-md-6">
                        <Button
                          color="primary-alta"
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
                        <Button color="primary-alta" onClick={() => handleShowTransferModal(true)}>
                          Transfer
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="rn-bid-details">
                    <BidTab
                      bids={product.putOnSale && product.auction.data.sellType == "Bidding" ? bids : null}
                      owner={product?.owner}
                      product={product}
                      properties={product?.collectibleProperties?.data}
                      tags={product?.tags}
                      history={product?.owner_histories?.data}
                    />
                    {product.putOnSale && (
                      <PlaceBet
                        highest_bid={{
                          amount: product.auction?.data?.bidPrice,
                          priceCurrency: product.auction?.data?.priceCurrency,
                          quantity: product.auction?.data?.quantity
                        }}
                        auction_date={product.auction?.data?.endTimeStamp}
                        product={product}
                        isOwner={product.auction?.data?.walletAddress == walletData.account}
                      />
                    )}
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
        handleSubmit={handleSubmit}
        paymentTokensList={product.collection?.data?.paymentTokens?.data}
      />
      <TimeAuctionModal
        show={showTimeAuctionModal}
        handleModal={handleTimeAuctionModal}
        supply={product?.supply}
        handleSubmit={handleSubmit}
        paymentTokensList={product.collection?.data?.paymentTokens?.data}
      />
      <TransferPopupModal
        show={showTransferModal}
        handleModal={handleShowTransferModal}
        handleSubmit={handleSubmitTransfer}
      />
    </div>
  );
};

ProductDetailsArea.propTypes = {
  space: PropTypes.oneOf([1, 2]),
  className: PropTypes.string,
  product: PropTypes.shape({
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
  bids: PropTypes.arrayOf(PropTypes.shape({}))
};

ProductDetailsArea.defaultProps = {
  space: 1
};

export default ProductDetailsArea;

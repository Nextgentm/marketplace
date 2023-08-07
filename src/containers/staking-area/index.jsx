import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import TabContent from "react-bootstrap/TabContent";
import TabContainer from "react-bootstrap/TabContainer";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import Product from "@components/product/layout-01";
import StakeProduct from "@components/product/layout-02";
import { ProductType } from "@utils/types";
import Pagination from "@components/pagination-02";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import SelectProducts from "@components/modals/select-products";
import { getStakingNFTContract, getStakingRewardTokenDecimal } from "src/lib/BlokchainHelperFunctions";
import { AppData } from "src/context/app-context";
import strapi from "@utils/strapi";

const StakingArea = ({ className,
  myStakingData, getMyStakingDataPaginationRecord, stakeDatapagination,
  myStakingCompletedData, getMyStakingCompletedDataPaginationRecord, stakeCompletedDatapagination,
  totalStakingReward, stakingDuration,
  loading, setLoading
}) => {
  const { walletData, setWalletData } = useContext(AppData);
  // tabs hooks
  const [tabsKey, setTabsKey] = useState("nav-stake");
  const [stakeMyCollectible, setStakeMyCollectible] = useState(false);

  // handle tabs hooks update
  const updateTabKey = (tab) => {
    setTabsKey(tab);
    refreshPageData();
  }

  // hook to hold selected data for unstaking
  const [allSelectedStake, setAllSelectedStake] = useState([]);

  const isExist = (id) => {
    let doesExist = allSelectedStake.some(function (ele) {
      return ele.id === id;
    });
    return doesExist;
  }

  // function to update Selected obj
  const updateSelectedNFT = async (obj) => {
    if (isExist(obj.id)) {
      const arr = allSelectedStake.filter(item => item.id !== obj.id)
      setAllSelectedStake(arr);
    } else {
      setAllSelectedStake([...allSelectedStake, obj]);
    }
  };

  // function to refresh collectible and data
  const refreshPageData = async () => {
    setAllSelectedStake([]);
    await getMyStakingDataPaginationRecord(1);
    await getMyStakingCompletedDataPaginationRecord(1);
  }

  // unstake batch collectibles
  const unstakeAllSelectedNFT = async () => {
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
        unstakedAmounts = [],
        stakingIndexs = [];
      let selectedNetworks = [];

      let _allSelectedStake = allSelectedStake;
      _allSelectedStake.map((stake) => {
        //NFTContractAddresses
        const contractAddress = stake.collectible.data.collection?.data?.collectionType === "Single" ?
          stake.collectible.data.collection?.data?.contractAddress
          : stake.collectible.data.collection?.data?.contractAddress1155;
        NFTContractAddresses.push(contractAddress);
        //tokenTypes
        const tokenType = stake.collectible.data.collection?.data?.collectionType === "Single" ? 1 : 0;
        tokenTypes.push(tokenType);
        //tokenIds
        const tokenId = stake.collectible.data.nftID;
        tokenIds.push(tokenId);
        //stakedAmount
        const unstakedAmount = stake.stakingAmount;
        unstakedAmounts.push(unstakedAmount);
        //stakingIndexs
        stakingIndexs.push(stake.index);
        //network
        if (!selectedNetworks.includes(stake.collectible.data.collection?.data?.networkType)) {
          selectedNetworks.push(stake.collectible.data.collection?.data?.networkType);
        }
      })

      if (selectedNetworks.length > 1) {
        toast.error("Can't unstake Collectible with multiple Networks");
        return;
      }
      console.log(NFTContractAddresses);
      console.log(tokenTypes);
      console.log(tokenIds);
      console.log(unstakedAmounts);
      console.log(stakingIndexs);

      const stakingNFT = await getStakingNFTContract(walletData);
      const transaction = await stakingNFT.unStakeTokenBatch(NFTContractAddresses, tokenTypes, tokenIds, unstakedAmounts, stakingIndexs);
      const receipt = await transaction.wait();
      console.log(receipt);

      _allSelectedStake.map(async (stake, index) => {
        // update auction to complete
        const res = await strapi.update("collectible-stakings", stake.id, {
          rewardAmount: unstakedAmounts[index],
          isClaimed: true
        });
        console.log(res);
      })

      await refreshPageData();
      toast.success("all unstake successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Error while unstake");
    }
  }

  // unstake batch collectibles
  const restakeAllSelectedNFT = async () => {
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
        stakingIndexs = [];
      let selectedNetworks = [];

      let _allSelectedStake = allSelectedStake;
      _allSelectedStake.map((stake) => {
        //NFTContractAddresses
        const contractAddress = stake.collectible.data.collection?.data?.collectionType === "Single" ?
          stake.collectible.data.collection?.data?.contractAddress
          : stake.collectible.data.collection?.data?.contractAddress1155;
        NFTContractAddresses.push(contractAddress);
        //tokenTypes
        const tokenType = stake.collectible.data.collection?.data?.collectionType === "Single" ? 1 : 0;
        tokenTypes.push(tokenType);
        //tokenIds
        const tokenId = stake.collectible.data.nftID;
        tokenIds.push(tokenId);
        //stakingIndexs
        stakingIndexs.push(stake.index);
        //network
        if (!selectedNetworks.includes(stake.collectible.data.collection?.data?.networkType)) {
          selectedNetworks.push(stake.collectible.data.collection?.data?.networkType);
        }
      })

      if (selectedNetworks.length > 1) {
        toast.error("Can't unstake Collectible with multiple Networks");
        return;
      }
      console.log(NFTContractAddresses);
      console.log(tokenTypes);
      console.log(tokenIds);
      console.log(stakingIndexs);

      const stakingNFT = await getStakingNFTContract(walletData);
      const stakeDuration = await stakingNFT.rewardRateDuration();
      const transaction = await stakingNFT.reStakeTokenBatch(NFTContractAddresses, tokenTypes, tokenIds, stakingIndexs);
      const receipt = await transaction.wait();
      console.log(receipt);

      for (let i = 0; i < _allSelectedStake.length; i++) {
        const stake = _allSelectedStake[i];
        // update stake
        const res = await strapi.update("collectible-stakings", stake.id, {
          stakingStartTime: new Date(),
          stakingEndTime: new Date(new Date().getTime() + 1000 * stakeDuration),
          restakingCount: stake.restakingCount + 1
        });
        console.log(res);
      }

      await refreshPageData();
      toast.success("all unstake successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Error while unstake");
    }
  }

  return (
    <div className={clsx("rn-authore-profile-area", className)}>
      <TabContainer defaultActiveKey={tabsKey}>
        <div className="container">
          <div className="row">
            <div className="col-6">
              {stakingDuration && <><span>Staking Duration: {stakingDuration}</span><br /></>}
              {totalStakingReward && <span>Staking Reward: {totalStakingReward}</span>}
            </div>
            <div className="col-6">
              <Button onClick={() => setStakeMyCollectible(true)} disabled={loading}>Stake My Collectible</Button>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="tab-wrapper-one">
                <nav className="tab-button-one">
                  <Nav className="nav nav-tabs" id="nav-tab" role="tablist">
                    <Nav.Link
                      as="button"
                      eventKey="nav-stake"
                      onClick={() => updateTabKey("nav-stake")}
                    >
                      Stake
                    </Nav.Link>
                    <Nav.Link
                      as="button"
                      eventKey="nav-completed"
                      onClick={() => updateTabKey("nav-completed")}
                    >
                      Stake Completed
                    </Nav.Link>
                  </Nav>
                </nav>
              </div>
            </div>
          </div>

          <div className="row selection-info-row">
            {allSelectedStake.length > 0 && (<>
              <div className="col selection-count">
                <span>{allSelectedStake.length} items selected</span>
              </div>
              <div className="col selection-button">
                {tabsKey == "nav-completed" &&
                  <Button onClick={() => restakeAllSelectedNFT()} disabled={loading}>
                    restake all selected
                  </Button>}
                <Button onClick={() => unstakeAllSelectedNFT()} disabled={loading}>
                  {tabsKey == "nav-stake" ? "Unstake All selected" : "Unstake & claim reward for all selected"}
                </Button>
              </div>
            </>
            )
            }
          </div>

          <TabContent className="tab-content rn-bid-content">
            <TabPane className="row g-5 d-flex" eventKey="nav-stake" id="nav-stake">
              {myStakingData?.map(
                (stake, index) => (
                  <div key={index} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12">
                    <StakeProduct
                      id={stake.id}
                      title={stake.collectible.data.name}
                      slug={stake.collectible.data.slug}
                      stakingAmount={stake.stakingAmount}
                      image={stake.collectible.data.image?.data ? stake.collectible.data.image?.data?.url : stake.collectible.data.image_url}
                      collectionName={stake.collectible.data.collection?.data?.name}
                      stakingIndex={stake.index}
                      restakingCount={stake.restakingCount}
                      stakingStartTime={stake.stakingStartTime}
                      stakingEndTime={stake.stakingEndTime}
                      collectionType={stake.collectible.data.collection?.data?.collectionType}
                      NFTContractAddress={stake.collectible.data.collection?.data?.collectionType === "Single" ?
                        stake.collectible.data.collection?.data?.contractAddress
                        : stake.collectible.data.collection?.data?.contractAddress1155}
                      nftID={stake.collectible.data.nftID}
                      network={stake.collectible.data.collection?.data?.networkType}
                      refreshPageData={getMyStakingDataPaginationRecord}
                      multiselection={true}
                      isSelected={isExist(stake.id)}
                      updateSelected={() => updateSelectedNFT(stake)}
                    />
                  </div>
                )
              )}
              {stakeDatapagination?.pageCount > 1 ? (
                <Pagination
                  className="single-column-blog"
                  currentPage={stakeDatapagination.page}
                  numberOfPages={stakeDatapagination.pageCount}
                  onClick={getMyStakingDataPaginationRecord}
                />
              ) : null}
            </TabPane>

            <TabPane className="row g-5 d-flex" eventKey="nav-completed" id="nav-completed">
              {myStakingCompletedData?.map(
                (stake, index) => (
                  <div key={index} className="col-5 col-lg-4 col-md-6 col-sm-6 col-12" onClick={() => updateSelectedNFT(stake)}>
                    <StakeProduct
                      id={stake.id}
                      title={stake.collectible.data.name}
                      slug={stake.collectible.data.slug}
                      stakingAmount={stake.stakingAmount}
                      image={stake.collectible.data.image?.data ? stake.collectible.data.image?.data?.url : stake.collectible.data.image_url}
                      collectionName={stake.collectible.data.collection?.data?.name}
                      stakingIndex={stake.index}
                      restakingCount={stake.restakingCount}
                      stakingStartTime={stake.stakingStartTime}
                      stakingEndTime={stake.stakingEndTime}
                      collectionType={stake.collectible.data.collection?.data?.collectionType}
                      NFTContractAddress={stake.collectible.data.collection?.data?.collectionType === "Single" ?
                        stake.collectible.data.collection?.data?.contractAddress
                        : stake.collectible.data.collection?.data?.contractAddress1155}
                      nftID={stake.collectible.data.nftID}
                      network={stake.collectible.data.collection?.data?.networkType}
                      refreshPageData={getMyStakingCompletedDataPaginationRecord}
                      multiselection={true}
                      isSelected={isExist(stake.id)}
                      updateSelected={() => updateSelectedNFT(stake)}
                    />
                  </div>
                )
              )}
              {stakeCompletedDatapagination?.pageCount > 1 ? (
                <Pagination
                  className="single-column-blog"
                  currentPage={stakeCompletedDatapagination.page}
                  numberOfPages={stakeCompletedDatapagination.pageCount}
                  onClick={getMyStakingCompletedDataPaginationRecord}
                />
              ) : null}
            </TabPane>
          </TabContent>
        </div>
      </TabContainer>

      <SelectProducts show={stakeMyCollectible} handleModal={(prev) => setStakeMyCollectible(!prev)} refreshPageData={refreshPageData} />
    </div>
  )
};

StakingArea.propTypes = {
  className: PropTypes.string,
  productData: PropTypes.arrayOf(PropTypes.shape({
    __typename: PropTypes.string,
    attributes: ProductType
  })),
};
export default StakingArea;

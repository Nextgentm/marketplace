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

  // tabs hooks
  const [tabsKey, setTabsKey] = useState("nav-stake");
  const [stakeMyCollectible, setStakeMyCollectible] = useState(false);

  // handle tabs hooks update
  const updateTabKey = (tab) => {
    setTabsKey(tab);
    refreshPageData();
  }

  // function to refresh collectible and data
  const refreshPageData = async () => {
    await getMyStakingDataPaginationRecord(1);
    await getMyStakingCompletedDataPaginationRecord(1);
  }

  return (
    <div className={clsx("rn-authore-profile-area", className)}>
      <TabContainer defaultActiveKey={tabsKey}>
        <div className="container">
          <div className="row staking-info">
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

          <TabContent className="tab-content rn-bid-content">
            <TabPane className="row g-5 d-flex" eventKey="nav-stake" id="nav-stake">
              {myStakingData?.length > 0 ? myStakingData?.map(
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
                    />
                  </div>
                )
              ) :
                <p>No item to show</p>}
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
              {myStakingCompletedData?.length > 0 ? myStakingCompletedData?.map(
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
                      refreshPageData={getMyStakingCompletedDataPaginationRecord}
                    />
                  </div>
                )
              ) :
                < p > No item to show</p>}
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
      </TabContainer >

      <SelectProducts show={stakeMyCollectible} handleModal={(prev) => setStakeMyCollectible(!prev)}
        loading={loading} setLoading={setLoading} refreshPageData={refreshPageData} />
    </div >
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

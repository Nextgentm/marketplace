import PropTypes from "prop-types";
import TopSeller from "@components/top-seller/layout-03";
import { IDType, ImageType } from "@utils/types";

const StakingTabContent = ({ stakingData, product, refreshPageData }) => (
  <div>
    {stakingData?.map((stake) => (
      <TopSeller
        key={stake?.id}
        id={stake?.id}
        walletAddress={stake?.walletAddress}
        stakingAmount={stake?.stakingAmount}
        stakingStartTime={stake?.stakingStartTime}
        isClaimed={stake?.isClaimed}
        rewardType={stake?.rewardType}
        index={stake?.index}
        NFTContractAddress={product.collection.data.collectionType === "Single" ? product.collection.data.contractAddress : product.collection.data.contractAddress1155}
        tokenId={product.nftID}
        product={product}
        refreshPageData={refreshPageData}
      />
    ))}
  </div>
);

StakingTabContent.propTypes = {
  stakingData: PropTypes.arrayOf(
    PropTypes.shape({
      id: IDType.isRequired,
      user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        image: ImageType.isRequired
      }),
      amount: PropTypes.string.isRequired,
      bidAt: PropTypes.string.isRequired
    })
  )
};

export default StakingTabContent;

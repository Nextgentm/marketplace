import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import client from "@utils/apollo-client";
import { AppData } from "../context/app-context";
import strapi from "@utils/strapi";
import StakingArea from "@containers/staking-area";
import Breadcrumb from "@components/breadcrumb";
import { convertWeitoEther, getStakingNFTContract, getTokenContract, secondsToHumanReadableString } from "src/lib/BlokchainHelperFunctions";
import { NETWORK_NAMES } from "@utils/constants";

export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const StakeCollectible = () => {
  const { userData: authorData } = useContext(AppData);
  const { walletData, setWalletData } = useContext(AppData);
  const [totalStakingReward, setTotalStakingReward] = useState(null); //page values
  const [stakingDuration, setStakingDuration] = useState(null); //page values
  const [loading, setLoading] = useState(false); //page values

  const [myStakingData, setMyStakingData] = useState([]);
  const [myStakingCompletedData, setMyStakingCompletedData] = useState([]);

  const [myStakingDataPagination, setMyStakingDataPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0
  });

  const [myStakingCompletedDataPagination, setMyStakingCompletedDataPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0
  });

  async function getTotalStakingRewardAndDurationData() {
    const stakingContract = await getStakingNFTContract(walletData);
    if (stakingContract) {
      const rewardRate = await stakingContract.rewardRate();
      const rewardRateDuration = await stakingContract.rewardRateDuration();
      const strrewardRateDuration = secondsToHumanReadableString(rewardRateDuration);// solidity second to js second
      const erc20Address = await stakingContract.rewardToken();
      // console.log(erc20Address);
      const tokenContract = await getTokenContract(walletData, erc20Address);
      const tokenName = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();
      // console.log(decimals);
      let convertedPrice = 0;
      if (decimals == 18) {
        convertedPrice = convertWeitoEther(walletData.ethers, rewardRate);
      } else {
        convertedPrice = (rewardRate * (10 ** decimals));
      }
      console.log(convertedPrice);
      setTotalStakingReward(`${convertedPrice} ${symbol} (${tokenName})`);
      setStakingDuration(strrewardRateDuration);
    }
  }

  useEffect(() => {
    if (authorData) {
      if (walletData.isConnected) {
        if (walletData.account) {
          getAllCollectionsData();
          getTotalStakingRewardAndDurationData();
        } else {
          setMyStakingData(null);
          setMyStakingCompletedData(null);
          setMyStakingData(null);
          setMyStakingCompletedData(null);
        }
      } else {
        setMyStakingData(null);
        setMyStakingCompletedData(null);
        setMyStakingData(null);
        setMyStakingCompletedData(null);
      }
    }
  }, [walletData]);

  const getAllCollectionsData = async () => {
    setLoading(true);
    await getMyStakingDataPaginationRecord(1);
    await getMyStakingDataCompletedPaginationRecord(1);
    setLoading(false);
  };

  const getMyStakingDataPaginationRecord = async (page) => {
    let stakingResponse = await strapi.find("collectible-stakings", {
      filters: {
        walletAddress: walletData.account,
        blockchain: { $ne: NETWORK_NAMES.NETWORK }, // Added blockchain filter
        isClaimed: false,
        stakingEndTime: {
          $gte: new Date()
        }
      },
      populate: {
        collectible: {
          populate: ["image", "collection"]
        }
      },
      pagination: {
        page,
        pageSize: myStakingDataPagination.pageSize
      },
      sort: ["id:asc"]
    });
    // console.log(stakingResponse);
    setMyStakingDataPagination(stakingResponse.meta.pagination);
    setMyStakingData(stakingResponse.data);
  };

  const getMyStakingDataCompletedPaginationRecord = async (page) => {
    let stakingResponse = await strapi.find("collectible-stakings", {
      filters: {
        walletAddress: walletData.account,
        isClaimed: false,
        blockchain: { $ne: NETWORK_NAMES.NETWORK }, // Added blockchain filter
        stakingEndTime: {
          $lt: new Date()
        }
      },
      populate: {
        collectible: {
          populate: ["image", "collection"]
        }
      },
      pagination: {
        page,
        pageSize: myStakingCompletedDataPagination.pageSize
      },
      sort: ["id:asc"]
    });
    // console.log(stakingResponse);
    setMyStakingCompletedDataPagination(stakingResponse.meta.pagination);
    setMyStakingCompletedData(stakingResponse.data);
  };

  return (
    <Wrapper>
      <SEO pageTitle="Stake Collectible" />
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle="Staking Collectible" currentPage="Staking Collectible" />
        {process.env.NEXT_PUBLIC_SENTRY_ENV !== "production" &&
          <StakingArea
            myStakingData={myStakingData}
            getMyStakingDataPaginationRecord={getMyStakingDataPaginationRecord} stakeDatapagination={myStakingDataPagination}
            myStakingCompletedData={myStakingCompletedData} getMyStakingCompletedDataPaginationRecord={getMyStakingDataCompletedPaginationRecord}
            stakeCompletedDatapagination={myStakingCompletedDataPagination}
            totalStakingReward={totalStakingReward} stakingDuration={stakingDuration}
            loading={loading} setLoading={setLoading}
          />
        }
      </main>
      <Footer />
    </Wrapper>
  );
};

export default StakeCollectible;

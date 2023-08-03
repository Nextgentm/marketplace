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

export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const StakeCollectible = () => {
  const { userData: authorData } = useContext(AppData);
  const { walletData, setWalletData } = useContext(AppData);
  const [myStakingData, setMyStakingData] = useState(null);
  const [myStakingCompletedData, setMyStakingCompletedData] = useState(null);

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


  useEffect(() => {
    if (authorData) {
      if (walletData.isConnected) {
        if (walletData.account) {
          getAllCollectionsData();
        } else {
          setMyStakingData(null);
          setMyStakingCompletedData(null);
        }
      } else {
        setMyStakingData(null);
        setMyStakingCompletedData(null);
      }
    }
  }, [walletData]);

  const getAllCollectionsData = async () => {
    getMyStakingDataPaginationRecord(1);
    getMyStakingDataCompletedPaginationRecord(1);
  };

  const getMyStakingDataPaginationRecord = async (page) => {
    let stakingResponse = await strapi.find("collectible-stakings", {
      filters: {
        walletAddress: "0x47af5440658eb8cb28a8fef88d18e10b7f48d38b"//walletData.account,
        // isClaimed: false,
        // stakingEndTime: {
        //   $gte: new Date()
        // }
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
    });
    // console.log(stakingResponse);
    setMyStakingDataPagination(stakingResponse.meta.pagination);
    setMyStakingData(stakingResponse.data);
  };

  const getMyStakingDataCompletedPaginationRecord = async (page) => {
    let stakingResponse = await strapi.find("collectible-stakings", {
      filters: {
        walletAddress: "0x47af5440658eb8cb28a8fef88d18e10b7f48d38b"//walletData.account,
        // isClaimed: false,
        // stakingEndTime: {
        //   $lt: new Date()
        // }
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
          />
        }
      </main>
      <Footer />
    </Wrapper>
  );
};

export default StakeCollectible;

import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import AuthorIntroArea from "@containers/author-intro";
import AuthorProfileArea from "@containers/author-profile";
import { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import client from "@utils/apollo-client";
import { AppData } from "../context/app-context";
import { ALL_COLLECTION_QUERY } from "../graphql/query/collection/getCollection";

// Demo data
import authorData from "../data/author.json";
import { ALL_COLLECTIBLE_LISTDATA_QUERY } from "src/graphql/query/collectibles/getCollectible";
import { useLazyQuery } from "@apollo/client";
import { addressIsAdmin } from "src/lib/BlokchainHelperFunctions";
import strapi from "@utils/strapi";
// import productData from "../data/products.json";

export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const Author = () => {
  const { userData: authorData } = useContext(AppData);
  const [allProductsData, setAllProductsData] = useState(null);
  const [allCreatedProductsData, setAllCreatedProductsData] = useState(null);
  const [allOnSaleProductsData, setAllOnSaleProductsData] = useState(null);
  const [allStakeData, setAllStakeData] = useState(null);
  const { walletData, setWalletData } = useContext(AppData);
  const [isAdminWallet, setIsAdminWallet] = useState(false);

  const [onSaleDatapagination, setOnSaleDataPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0
  });

  const [ownedDatapagination, setOwnedDataPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0
  });

  const [createdDatapagination, setCreatedDataPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0
  });

  const [stakeDatapagination, setStakeDataPagination] = useState({
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
          // check is Admin
          addressIsAdmin(walletData).then((validationValue) => {
            setIsAdminWallet(validationValue);
          }).catch((error) => { console.log("Error while factory call " + error) });
        } else {
          setIsAdminWallet(false);
        }
      } else {
        setAllProductsData(null);
        setIsAdminWallet(false);
        // toast.error("Please connect wallet first");
      }
    }
  }, [walletData]);

  const getAllCollectionsData = async () => {
    getOwnedDatapaginationRecord(1);

    getCreatedDatapaginationRecord(1);

    getOnSaleDatapaginationRecord(1);

    getStakeDatapaginationRecord(1);
  };

  const getOnSaleDatapaginationRecord = async (page) => {
    let onsaleResponse = await strapi.find("auctions", {
      filters: {
        $and: [
          {
            status: {
              $eq: "Live"
            }
          },
          {
            walletAddress: {
              $eq: walletData.account
            }
          }
        ]
      },
      populate: {
        collectible: {
          populate: ["image", "collection"]
        },
        biddings: {
          fields: ["id"]
        }
      },
      pagination: {
        page,
        pageSize: onSaleDatapagination.pageSize
      },
    });
    // console.log(onsaleResponse);
    setOnSaleDataPagination(onsaleResponse.meta.pagination);
    setAllOnSaleProductsData(onsaleResponse.data);
  };

  const getOwnedDatapaginationRecord = async (page) => {
    let response = await strapi.find("collectible/get-owned-collectible/" + walletData.account, {
      filters: {},
      populate: "*",
      pagination: {
        page,
        pageSize: ownedDatapagination.pageSize
      },
    });
    // console.log(response);
    setOwnedDataPagination(response.meta.pagination);
    setAllProductsData(response.data);
  };

  const getCreatedDatapaginationRecord = async (page) => {
    let creatorResponse = await strapi.find("collectibles", {
      filters: {
        creator: {
          $eq: walletData.account
        }
      },
      populate: "*",
      pagination: {
        page,
        pageSize: createdDatapagination.pageSize
      },
    });
    // console.log(creatorResponse);
    setCreatedDataPagination(creatorResponse.meta.pagination);
    setAllCreatedProductsData(creatorResponse.data);
  };

  const getStakeDatapaginationRecord = async (page) => {
    let stakingResponse = await strapi.find("collectible-stakings", {
      filters: {
        walletAddress: walletData.account,
        isClaimed: false
      },
      populate: {
        collectible: {
          populate: ["image", "collection"]
        }
      },
      pagination: {
        page,
        pageSize: stakeDatapagination.pageSize
      },
    });
    // console.log(stakingResponse);
    setStakeDataPagination(stakingResponse.meta.pagination);
    setAllStakeData(stakingResponse.data);
  };

  return (
    <Wrapper>
      <SEO pageTitle="Author" />
      <Header />
      <main id="main-content">
        <AuthorIntroArea data={authorData} />
        <AuthorProfileArea productData={allProductsData} allCreatedProductsData={allCreatedProductsData}
          allStakeData={allStakeData}
          allOnSaleProductsData={allOnSaleProductsData} isAdminWallet={isAdminWallet}
          getOnSaleDatapaginationRecord={getOnSaleDatapaginationRecord} onSaleDatapagination={onSaleDatapagination}
          getOwnedDatapaginationRecord={getOwnedDatapaginationRecord} ownedDatapagination={ownedDatapagination}
          getCreatedDatapaginationRecord={getCreatedDatapaginationRecord} createdDatapagination={createdDatapagination}
          getStakeDatapaginationRecord={getStakeDatapaginationRecord} stakeDatapagination={stakeDatapagination} />
      </main>
      <Footer />
    </Wrapper>
  );
};

export default Author;

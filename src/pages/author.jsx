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
  const { walletData, setWalletData } = useContext(AppData);
  const [isAdminWallet, setIsAdminWallet] = useState(false);

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

    let response = await strapi.find("collectibles", {
      filters: {
        $or: [{
          $and: [{
            owner: {
              $eq: walletData.account
            },
          }, {
            collection: {
              collectionType: {
                $eq: "Single"
              }
            },
          }]
        }, {
          $and: [{
            owner_histories: {
              toWalletAddress: {
                $eq: walletData.account
              }
            },
          }, {
            collection: {
              collectionType: {
                $ne: "Single"
              }
            },
          }]
        }]
      },
      populate: "*",
    });
    // console.log(response.data);
    setAllProductsData(response.data);

    let creatorResponse = await strapi.find("collectibles", {
      filters: {
        creator: {
          $eq: walletData.account
        }
      },
      populate: "*",
    });
    console.log(creatorResponse);
    setAllCreatedProductsData(creatorResponse.data);

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
    });
    // console.log(onsaleResponse.data);
    setAllOnSaleProductsData(onsaleResponse.data);
  };

  return (
    <Wrapper>
      <SEO pageTitle="Author" />
      <Header />
      <main id="main-content">
        <AuthorIntroArea data={authorData} />
        <AuthorProfileArea productData={allProductsData} allCreatedProductsData={allCreatedProductsData}
          allOnSaleProductsData={allOnSaleProductsData} isAdminWallet={isAdminWallet} />
      </main>
      <Footer />
    </Wrapper>
  );
};

export default Author;

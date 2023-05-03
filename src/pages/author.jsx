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
// import productData from "../data/products.json";

export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const Author = () => {
  const { userData: authorData } = useContext(AppData);
  const [allProductsData, setAllProductsData] = useState(null);
  const { walletData, setWalletData } = useContext(AppData);

  const [getCollectible, { data: collectiblesFilters, error }] = useLazyQuery(ALL_COLLECTIBLE_LISTDATA_QUERY, {
    fetchPolicy: "cache-and-network"
  });

  useEffect(() => {
    if (collectiblesFilters?.collectibles) {
      console.log("collectiblesFilters?.collectibles", collectiblesFilters?.collectibles);
      setAllProductsData(collectiblesFilters?.collectibles.data);
    }
  }, [collectiblesFilters, error]);

  useEffect(() => {
    if (authorData) {
      if (walletData.isConnected) {
        if (walletData.account) {
          getAllCollectionsData();
        }
      } else {
        setAllProductsData(null);
        // toast.error("Please connect wallet first");
      }
    }
  }, [walletData]);

  const getAllCollectionsData = async () => {
    getCollectible({
      variables: {
        filter: {
          owner: {
            eq: walletData.account
          }
        }
      }
    });
    // const res = await fetch(
    //   `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/?populate=image&filters[owner][$eq]=${walletData.account}`
    // );
    // const productData = await res.json();
    // console.log(productData.data);
    // setAllProductsData(productData.data);
  };

  return (
    <Wrapper>
      <SEO pageTitle="Author" />
      <Header />
      <main id="main-content">
        <AuthorIntroArea data={authorData} />
        <AuthorProfileArea productData={allProductsData} />
      </main>
      <Footer />
    </Wrapper>
  );
};

export default Author;

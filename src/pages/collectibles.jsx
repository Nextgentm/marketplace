import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-10";

// Demo data
import { useState, useEffect } from "react";
import axios from "axios";
import productData from "../data/products.json";
import { ALL_COLLECTIBLE_LISTDATA_QUERY } from "src/graphql/query/collectibles/getCollectible";
import client from "@utils/apollo-client";
import { useRouter } from "next/router";

// export async function getStaticProps() {
//   return { props: { className: "template-color-1" } };
// }

const Collectibles = ({ dataCollectibles }) => {
  return (
    <Wrapper>
      <SEO pageTitle="Explore Simple" />
      {/* {console.log("data=-=-Collectibles", dataCollectibles)} */}
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle="Explore NFT" currentPage="Explore NFT" />
        {dataCollectibles && (
          <ExploreProductArea
            data={{
              section_title: {
                title: "Find Your Non Replaceable Token"
              },
              products: dataCollectibles.data,
              placeBid: true,
              collectionData: dataCollectibles,
              paginationdata: dataCollectibles.meta.pagination
            }}
          />
        )}
      </main>
      <Footer />
    </Wrapper>
  );
};

Collectibles.getInitialProps = async (ctx) => {
  let routerQuery = ctx.query.collection;

  let filters = {
    auction: {
      status: {
        eq: "Live"
      }
    }
  };

  if (ctx.query.collection) {
    filters.collection = {
      name: {
        in: routerQuery
      }
    };
  }
  const { data } = await client.query({
    query: ALL_COLLECTIBLE_LISTDATA_QUERY,
    variables: {
      filter: filters,
      pagination: {
        pageSize: 6
      },
      sort: ["createdAt:desc"]
    },
    fetchPolicy: "network-only"
  });
  return {
    className: "template-color-1",
    dataCollectibles: data.collectibles
  };
};

export default Collectibles;

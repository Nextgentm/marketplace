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
import { getCollectible } from "src/services/collections/collection";

// export async function getStaticProps() {
//   return { props: { className: "template-color-1" } };
// }

const Collectibles = ({ dataCollectibles }) => {
  return (
    <Wrapper>
      <SEO pageTitle="Explore Simple" />
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
  const data = await getCollectible({
    filters: {
      auction: {
        status: "Live"
      }
    },
    populate: {
      collection: {
        fields: "*",
        populate: {
          cover: {
            fields: "*"
          },
          logo: {
            fields: "*"
          }
        }
      },
      auction: {
        fields: "*",
        filters: {
          status: "Live",
          id: { $notNull: true }
        }
      },
      image: {
        fields: "*"
      }
    },
    pagination: {
      limit: 6,
      start: 0,
      withCount: true
    }
  });
  return {
    className: "template-color-1",
    dataCollectibles: data
  };
};

export default Collectibles;

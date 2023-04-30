import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import HeroArea from "@containers/hero/layout-06";
import CollectionArea from "@containers/collection/layout-01";
import NewestItmesArea from "@containers/product/layout-04";
import ExploreProductArea from "@containers/explore-product/layout-02";
import CreatorArea from "@containers/creator/layout-01";
import ServiceArea from "@containers/services/layout-01";
import { normalizedData } from "@utils/methods";

// Demo data
import { useState, useEffect } from "react";
import axios from "axios";
import homepageData from "../data/homepages/home-06.json";
import sellerData from "../data/sellers.json";
import productData from "../data/products.json";
import client from "@utils/apollo-client";
import { ALL_COLLECTIBLE_LISTDATA_QUERY } from "src/graphql/query/collectibles/getCollectible";
import { GET_COLLECTION_LISTDATA_QUERY } from "src/graphql/query/collection/getCollection";
import LiveExploreArea from "@containers/live-explore/layout-01";

// export async function getStaticProps() {
//   return { props: { className: "template-color-1" } };
// }

const Home = ({ liveAuctionData, newestData, dataCollectibles, dataCollection }) => {
  const content = normalizedData(homepageData?.content || []);
  return (
    <Wrapper>
      <SEO pageTitle="NFT Marketplace" />
      <Header />
      <main id="main-content">
        <HeroArea data={content["hero-section"]} />
        <LiveExploreArea
          data={{
            ...content["live-explore-section"],
            products: liveAuctionData,
          }}
        />

        <NewestItmesArea
          data={{
            ...content["newest-section"],
            products: newestData,
          }}
        />
        <CollectionArea
          data={
            dataCollection && {
              ...content["collection-section"],
              collections: dataCollection
            }
          }
        />
        <ExploreProductArea
          data={
            dataCollectibles && {
              ...content["explore-product-section"],
              products: dataCollectibles
            }
          }
        />
        {/* <CreatorArea
          data={{
            ...content["top-sller-section"],
            creators: sellerData
          }}
        /> */}
        {/* <ServiceArea data={content["service-section"]} /> */}
      </main>
      <Footer />
    </Wrapper>
  );
};

Home.getInitialProps = async () => {
  const liveAuctionData = await client.query({
    query: ALL_COLLECTIBLE_LISTDATA_QUERY,
    variables: {
      filter: {
        putOnSale: {
          eq: true
        },
        auction: {
          sellType: {
            eq: "Bidding"
          }
        }
      },
      sort: "auction.startTimestamp:desc"
    },
    fetchPolicy: "network-only"
  });

  const newestItems = await client.query({
    query: ALL_COLLECTIBLE_LISTDATA_QUERY,
    variables: {
      filter: {
        putOnSale: {
          eq: true
        }
      },
      pagination: {
        pageSize: 10
      },
      sort: "auction.startTimestamp:desc"
    },
    fetchPolicy: "network-only"
  });

  const dataCollectibles = await client.query({
    query: ALL_COLLECTIBLE_LISTDATA_QUERY,
    variables: {
      filter: {
        putOnSale: {
          eq: true
        }
      },
      sort: "createdAt"
    },
    fetchPolicy: "network-only"
  });

  const dataCollection = await client.query({
    query: GET_COLLECTION_LISTDATA_QUERY,
    variables: {
      filters: {
        collectibles: {
          putOnSale: {
            eq: true
          }
        }
      },
      collectiblesFilters: {
        putOnSale: {
          eq: true
        },
      },
      pagination: {
        pageSize: 5
      },
      sort: "createdAt"
    },
    fetchPolicy: "network-only"
  });

  return {
    className: "template-color-1",
    liveAuctionData: liveAuctionData.data.collectibles?.data,
    newestData: newestItems.data.collectibles?.data,
    dataCollectibles: dataCollectibles.data.collectibles?.data,
    dataCollection: dataCollection.data.collections.data
  };
};

export default Home;

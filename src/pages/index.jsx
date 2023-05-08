import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import HeroArea from "@containers/hero/layout-06";
import CollectionArea from "@containers/collection/layout-01";
import NewestItmesArea from "@containers/product/layout-04";
import ExploreProductArea from "@containers/explore-product/layout-02";
import { normalizedData } from "@utils/methods";

// Demo data
import homepageData from "../data/homepages/home-06.json";
import client from "@utils/apollo-client";
import { ALL_COLLECTIBLE_LISTDATA_QUERY } from "src/graphql/query/collectibles/getCollectible";
import { GET_COLLECTION_LISTDATA_QUERY } from "src/graphql/query/collection/getCollection";
import LiveExploreArea from "@containers/live-explore/layout-01";
import strapi from "@utils/strapi";
import ServiceArea from "@containers/services/layout-01";
import { getCollection } from "src/services/collections/collection";

const Home = ({ liveAuctionData, newestData, dataCollectibles, dataCollection }) => {
  const content = normalizedData(homepageData?.content || []);
  const submit = async () => {
    const filter = {
      filters: {
        collectionType: {
          $eq: "Multiple"
        }
      }
    };
    let response = await strapi.find("collections", null);
    console.log(response);
  };
  return (
    <Wrapper>
      <SEO pageTitle="NFT Marketplace" />
      <Header />
      <main id="main-content">
        <HeroArea data={content["hero-section"]} />
        <LiveExploreArea
          data={{
            ...content["live-explore-section"],
            products: liveAuctionData
          }}
        />

        <NewestItmesArea
          data={{
            ...content["newest-section"],
            products: newestData
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
        <ServiceArea data={content["service-section"]} />
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
        auction: {
          status: {
            eq: "Live"
          },
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
        auction: {
          status: {
            eq: "Live"
          },
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
        auction: {
          status: {
            eq: "Live"
          },
        }
      },
      sort: "auction.startTimestamp:desc"
    },
    fetchPolicy: "network-only"
  });

  const dataCollection = await getCollection({
    filters: {
      collectibles: {
        auction: {
          sellType: "Bidding"
        }
      }
    },
    populate: "*",
    pagination: {
      limit: 8,
      start: 0,
      withCount: true
    }
  });
  console.log("dataCollection654", dataCollection);

  return {
    className: "template-color-1",
    liveAuctionData: liveAuctionData.data.collectibles?.data,
    newestData: newestItems.data.collectibles?.data,
    dataCollectibles: dataCollectibles.data.collectibles?.data,
    dataCollection: dataCollection.data
  };
};

export default Home;

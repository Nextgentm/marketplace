import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import HeroArea from "@containers/hero/layout-06";
import CollectionArea from "@containers/collection/layout-01";
import NewestItmesArea from "@containers/product/layout-04";
import OtherMarketplaceCollectibles from "@containers/product/layout-05";
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
import { getCollection, getCollectible } from "src/services/collections/collection";
import { NETWORK_NAMES } from "@utils/constants";

const Home = ({ liveAuctionData, newestData, dataCollectibles, dataCollection, allCollections }) => {
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
      <SEO
        pageTitle="Digital Collectibles | Sports Collectibles | Digital Trading Cards | Meta Avatars | Blockchain Technology | Web3 Gaming | NFT Marketplace"
        description="Explore LootMogul Digital Collectible Marketplace for exclusive Sports Collectibles. Trade Digital Trading Cards and meta avatars with real-life rewards in the form of NFTs using advanced blockchain technology"
        keywords="NFT marketplace,digital collectibles,sports trading cards,meta avatars,blockchain technology,Web3 gaming,digital goods,real-life rewards,sports enthusiasts"
      />
      <Header />
      <main id="main-content">
        <HeroArea data={content["hero-section"]} />
        {liveAuctionData.length > 0 &&
          <LiveExploreArea
            data={{
              ...content["live-explore-section"],
              products: liveAuctionData
            }}
          />}

        <NewestItmesArea
          data={{
            ...content["newest-section"],
            products: newestData
          }}
        />
        {/* <OtherMarketplaceCollectibles
          data={
            dataCollectibles && {
              ...content["other-marketplace-product-section"],
              products: otherMarketplaceCollectibles
            }
          }
        /> */}
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
              products: dataCollectibles,
              allCollections: allCollections
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
  const filter = {
    filters: {
      status: {
        $eq: "Live"
      },
      endTimeStamp: {
        $gt: new Date()
      },
      blockchain: { $ne: NETWORK_NAMES.NETWORK },
      sellType: {
        $eq: "Bidding"
      }
    },
    populate: {
      collectible: {
        populate: ["image", "collection"]
      },
      biddings: {
        fields: ["id"]
      },
    },
    sort: { startTimestamp: "desc" }
  }
  let liveAuctionData = await strapi.find("auctions", filter);
  // console.log(liveAuctionData);
  // const liveAuctionData = await client.query({
  //   query: ALL_COLLECTIBLE_LISTDATA_QUERY,
  //   variables: {
  //     filter: {
  //       auction: {
  //         status: {
  //           eq: "Live"
  //         },
  //         sellType: {
  //           eq: "Bidding"
  //         }
  //       }
  //     },
  //     sort: "auction.startTimestamp:desc"
  //   },
  //   fetchPolicy: "network-only"
  // });

  let newestItemsData = await strapi.find("collectible/newestItems");
  // console.log(newestItemsData);
  let newestItemsIds = [];
  newestItemsIds.push(...newestItemsData.map(emp => emp.id));
  // console.log(newestItemsIds);

  let newestItemsFilter = {
    filters: {
      status: {
        $eq: "Live"
      },
      blockchain: { $ne: NETWORK_NAMES.NETWORK },
      id: {
        $in: newestItemsIds
      }
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
      limit: 10
    },
    sort: {
      collectible: {
        createdAt: "desc"
      }
    }
  }
  if (process.env.NEXT_PUBLIC_SENTRY_ENV == "production") {
    newestItemsFilter.filters.walletAddress = {
      $eq: "0x69ca7ed1e033b42c28d5e3a7b802bd74f63e752a"
    }
  }
  let newestItems = await strapi.find("auctions", newestItemsFilter);
  newestItems.data.sort((a, b) => newestItemsIds.indexOf(a.id) - newestItemsIds.indexOf(b.id));
  // console.log(newestItems);
  // const newestItems = await client.query({
  //   query: ALL_COLLECTIBLE_LISTDATA_QUERY,
  //   variables: {
  //     filter: {
  //       auction: {
  //         status: {
  //           eq: "Live"
  //         },
  //       }
  //     },
  //     pagination: {
  //       pageSize: 10
  //     },
  //     sort: "auction.startTimestamp:desc"
  //   },
  //   fetchPolicy: "network-only"
  // });

  const allCollections = await getCollection({
    fields: ["name", "id"],
    filters: {
      collectibles: {
        auction: {
          status: "Live",
          endTimeStamp: {
            $gt: new Date()
          },
        }
      },
      id: {
        $ne: 14
      }
    },
    sort: ["priority:asc"],
    pagination: {
      limit: 25,
    }
  });
  let dataCollectiblesFilter = {
    filters: {
      status: {
        $eq: "Live"
      },
      endTimeStamp: {
        $gt: new Date()
      },
      blockchain: { $ne: NETWORK_NAMES.NETWORK },
    },
    populate: {
      collectible: {
        populate: ["image", "collection"]
      },
      biddings: {
        fields: ["id"]
      }
    },
    sort: { collectible: { priority: "asc" }, startTimestamp: "desc" }
  }
  if (process.env.NEXT_PUBLIC_SENTRY_ENV == "production") {
    dataCollectiblesFilter.filters.walletAddress = {
      $eq: "0x69ca7ed1e033b42c28d5e3a7b802bd74f63e752a"
    }
  }
  let dataCollectibles = await strapi.find("auctions", dataCollectiblesFilter);
  // const dataCollectibles = await client.query({
  //   query: ALL_COLLECTIBLE_LISTDATA_QUERY,
  //   variables: {
  //     filter: {
  //       auction: {
  //         status: {
  //           eq: "Live"
  //         },
  //       }
  //     },
  //     sort: "auction.startTimestamp:desc"
  //   },
  //   fetchPolicy: "network-only"
  // });

  const dataCollection = await getCollection({
    filters: {
      collectibles: {
        auction: {
          status: {
            $eq: "Live"
          },
          endTimeStamp: {
            $gt: new Date()
          },
        }
      }
    },
    sort: ["priority:asc"],
    populate: {
      collectibles: {
        fields: "*",
        filters: {
          auction: {
            status: "Live",
            endTimeStamp: {
              $gt: new Date()
            },
            id: { $notNull: true }
          }
        },
        populate: {
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              endTimeStamp: {
                $gt: new Date()
              },
              id: { $notNull: true }
            }
          }
        }
      },
      cover: {
        fields: "*"
      },
      logo: {
        fields: "*"
      }
    },
    pagination: {
      limit: 8,
      start: 0,
      withCount: true
    }
  });

  // console.log("dataCollection654", dataCollection);

  // const otherMarketplaceData = await getCollectible({
  //   filters: {
  //     isOpenseaCollectible: true
  //   },
  //   populate: {
  //     collection: {
  //       fields: "*",
  //       populate: {
  //         cover: {
  //           fields: "*"
  //         },
  //         logo: {
  //           fields: "*"
  //         }
  //       }
  //     },
  //     auction: {
  //       fields: "*",
  //       filters: {
  //         status: "Live",
  //         id: { $notNull: true }
  //       }
  //     },
  //     image: {
  //       fields: "*"
  //     }
  //   },
  //   pagination: {
  //     limit: 6,
  //     start: 0,
  //     withCount: true
  //   }
  // });

  return {
    className: "template-color-1",
    liveAuctionData: liveAuctionData.data,
    newestData: newestItems.data,
    dataCollectibles: dataCollectibles.data,
    dataCollection: dataCollection.data,
    allCollections: allCollections.data,
    // otherMarketplaceCollectibles: otherMarketplaceData.data,
  };
};

export default Home;

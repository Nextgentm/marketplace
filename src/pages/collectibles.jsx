import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-10";
import { getCollectible, getCollection } from "src/services/collections/collection";
import { NETWORK_NAMES } from "@utils/constants";

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

const Collectibles = ({ dataCollectibles, categoriesolds }) => {
  const router = useRouter();

  return (
    <Wrapper>
      <SEO pageTitle="Explore Simple" />
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle="Digital Collectible" currentPage="Explore Digital Collectible" isCollection={true} />
        {dataCollectibles && (
          <ExploreProductArea
            data={{
              section_title: {
                title: "Find Your Non Replaceable Token"
              },
              placeBid: true,
              categoriesolds: categoriesolds,
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
  try {
    // collection count
    let categoriesolds = {};
    const getAllCollections = await getCollection({
      fields: ["name", "id"],
      filters: {
        collectibles: {
          auction: {
            status: "Live",
            endTimeStamp: {
              $gt: new Date()
            },
          }
        }
      },
      sort: ["priority:asc"],
      pagination: {
        limit: 25,
      }
    });

    const allCollections = getAllCollections.data;
    for (let i = 0; i < allCollections.length; i++) {
      const collection = allCollections[i];
      const getdataAll = await getCollectible({
        filters: {
          auction: {
            status: "Live",
            endTimeStamp: {
              $gt: new Date()
            },
          },
          collection: collection.id
        },
        populate: {
          fields: ["name", "id"],
        },
        pagination: {
          limit: 1,
        }
      });
      categoriesolds[collection.name] = getdataAll.meta.pagination.total;
    }

    const data = await getCollectible({
      filters: {
        $or: [{
          auction: {
            status: "Live",
            endTimeStamp: {
              $gt: new Date()
            },
          }
        }, {
          isOpenseaCollectible: true
        }]
      },
      sort: ["priority:asc"],
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
            endTimeStamp: {
              $gt: new Date()
            },
            id: { $notNull: true }
          }
        },
        image: {
          fields: "*"
        }
      },
      pagination: {
        limit: 9,
        start: 0
      }
    });

    return {
      className: "template-color-1",
      dataCollectibles: data,
      categoriesolds: categoriesolds
    };
  } catch (error) {
    console.error("Error in getInitialProps:", error);
    return {
      className: "template-color-1",
      dataCollectibles: null,
      categoriesolds: {}
    };
  }
};

export default Collectibles;

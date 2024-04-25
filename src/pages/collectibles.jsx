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
import { getCollectible, getCollection } from "src/services/collections/collection";

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
        <Breadcrumb pageTitle={router.query.collection ? "Explore Collection" : "Digital Collectible"} currentPage={router.query.collection ? "Explore Collection" : "Digital Collectible"} isCollection={true} />
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
  // collection count
  let categoriesolds = {};
  const getAllCollections = await getCollection({
    fields: ["name", "id"],
    filters: {
      collectibles: {
        auction: {
          status: "Live"
        }
      }
    },
    sort: ["priority:asc"],
    pagination: {
      limit: 25,
    }
  });
  // console.log(getAllCollections);
  const allCollections = getAllCollections.data;
  for (let i = 0; i < allCollections.length; i++) {
    const collection = allCollections[i];
    const getdataAll = await getCollectible({
      filters: {
        auction: {
          status: "Live"
        },
        collection: collection.id
      },
      populate: {
        fields: ["name", "id"],
      },
      sort: ["priority:asc"],
      pagination: {
        limit: 1,
      }
    });
    // console.log(collection.name, getdataAll);
    categoriesolds[collection.name] = getdataAll.meta.pagination.total;
  }
  const data = await getCollectible({
    filters: {
      $or: [{
        auction: {
          status: "Live"
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
};

export default Collectibles;

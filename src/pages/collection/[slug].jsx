import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-09";

// Demo data
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import client from "@utils/apollo-client";
import { getCollectible, getCollection } from "src/services/collections/collection";
import strapi from "@utils/strapi";
import { NETWORK_NAMES } from "@utils/constants";
// import productData from "../data/products.json";

const CollectionDetail = ({ collection, collectibles }) => {

  return (
    <Wrapper>
      <SEO pageTitle={collection?.name} />
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle={"Explore Collection"} currentPage={collection?.name} isCollection={true} />
        {collectibles.data && (
          <ExploreProductArea
            data={{
              section_title: {
                title: `${collection?.name} Collection`
              },
              products: collectibles,
              collectionPage: true,
              collection: collection
            }}
          />
        )}
      </main>
      <Footer />
    </Wrapper>
  );
};

export async function getStaticPaths() {
  try {
    let productData = [];
    let page = 1, pageCount = 1, pageSize = 25;
    do {
      // console.log(page, pageCount, pageSize);
      const resData = await strapi.find("collections", {
        fields: ["id", "slug"],
        blockchain: { $ne: NETWORK_NAMES.NETWORK }, // Added blockchain filter
        pagination: {
          page: page,
          pageSize: pageSize
        }
      });
      productData = productData.concat(resData.data);
      page++;
      pageCount = resData.meta.pagination.pageCount;
    } while (page <= pageCount);
    // console.log(productData);
    return {
      paths: productData.map(({ slug }) => ({
        params: {
          slug
        }
      })),
      fallback: false
    };
  } catch (er) {
    return { paths: [], fallback: false } // <- ADDED RETURN STMNT
  }
}

export async function getStaticProps({ params }) {
  // collection
  const getCollections = await getCollection({
    filters: {
      slug: {
        $eq: params.slug
      }
    },
  });
  // console.log(getCollections);
  const collection = getCollections.data[0];
  // console.log(collection);
  const getCollectiblecheckData = await getCollectible({
    filters: {
      auction: {
        status: "Live",
        endTimeStamp: {
          $gt: new Date()
        },
      },
      collection: {
        id: {
          $eq: collection.id
        }
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
          endTimeStamp: {
            $gt: new Date()
          },
          // id: { $notNull: true }
        }
      },
      image: {
        fields: "*"
      }
    },
    sort: ["priority:asc"],
    pagination: {
      page: 1,
      pageCount: 1,
      pageSize: 9
    }
  });
  // console.log(getCollectiblecheckData.data);

  return {
    props: {
      className: "template-color-1",
      collection: collection,
      collectibles: getCollectiblecheckData
    } // will be passed to the page component as props
  };
}

export default CollectionDetail;

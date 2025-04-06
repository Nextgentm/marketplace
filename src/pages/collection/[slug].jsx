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
      console.log(`${process.env.BlOCKCHAIN}`,"third filters")
      // console.log(page, pageCount, pageSize);
      const resData = await strapi.find("collections", {
        fields: ["id", "slug"],
        filters: {
            blockchain: { $eq: NETWORK_NAMES.NETWORK } // Added blockchain filter
        },
        pagination: {
          page: page,
          pageSize: pageSize
        }
      });
      productData = [...productData, ...resData.data];
      pageCount = resData.meta.pagination.pageCount;
      page++;
    } while (page <= pageCount);
    const paths = productData.map((collection) => ({
      params: { slug: collection.slug }
    }));
    return {
      paths,
      fallback: "blocking" // Enable fallback for new collections
    };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return {
      paths: [],
      fallback: "blocking" // Enable fallback even if there's an error
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    // collection
    const getCollections = await getCollection({
      filters: {
        slug: {
          $eq: params.slug
        }
      },
    });

    // If no collection found, return 404
    if (!getCollections.data || getCollections.data.length === 0) {
      return {
        notFound: true
      };
    }

    const collection = getCollections.data[0];
    
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
            }
          }
        }
      }
    });

    return {
      props: {
        collection,
        collectibles: getCollectiblecheckData
      },
      revalidate: 60 // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      notFound: true
    };
  }
}

export default CollectionDetail;

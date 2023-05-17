import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-10";

// Demo data
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import client from "@utils/apollo-client";
import { GET_COLLECTION_LISTDATA_QUERY } from "src/graphql/query/collection/getCollection";
// import productData from "../data/products.json";

const CollectionDetail = ({ collections }) => {

  return (
    <Wrapper>
      <SEO pageTitle={collections?.name} />
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle={collections?.name} currentPage={collections?.name} />
        {collections?.collectibles.data && (
          <ExploreProductArea
            data={{
              section_title: {
                title: "Find Your Non Replaceable Token"
              },
              products: collections?.collectibles?.data,
              placeBid: true,
              collectionPage: true,
              collectionData: collections
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections/?populate=*`);
    const productData = await res.json();
    return {
      paths: productData.data.map(({ slug }) => ({
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
  const { data } = await client.query({
    query: GET_COLLECTION_LISTDATA_QUERY,
    variables: {
      filters: {
        slug: {
          eq: params.slug
        },
      },
      collectiblesFilters: {
        auction: {
          status: {
            eq: "Live"
          }
        },
      },
      pagination: {
        pageSize: 8
      }
    },
    fetchPolicy: "network-only"
  });
  return {
    props: {
      className: "template-color-1",
      collections: data?.collections?.data[0]?.attributes
    } // will be passed to the page component as props
  };
}

export default CollectionDetail;

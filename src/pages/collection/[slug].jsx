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
// import productData from "../data/products.json";

const CollectionDetail = ({ collections }) => {
  console.log(collections);
  return (
    <Wrapper>
      <SEO pageTitle={collections.name} />
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle={collections.name} currentPage={collections.name} />
        {collections && (
          <ExploreProductArea
            data={{
              section_title: {
                title: "Find Your Non Replaceable Token"
              },
              products: collections.collectibles.data,
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
}

export async function getStaticProps({ params }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections/?populate[collectibles][populate][0]=image`
  );
  const productData = await res.json();
  const collections = productData.data.find(({ slug }) => slug === params.slug);
  return {
    props: {
      className: "template-color-1",
      collections
    } // will be passed to the page component as props
  };
}

export default CollectionDetail;

import PropTypes from "prop-types";
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ProductDetailsArea from "@containers/product-details";
import ProductArea from "@containers/product/layout-03";
import { shuffleArray } from "@utils/methods";

// import { useRouter } from "next/router";
// import { useState, useEffect } from "react";
// import axios from "axios";

// demo data
// import productData from "../../data/products.json";

const ProductDetails = ({ product, bids, recentViewProducts, relatedProducts }) => (
  // const router = useRouter();

  /* const [dataCollectibles, setDataCollectibles] = useState(null);
    useEffect(() => {
        axios
            .get(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/3?populate=*`
            )
            .then((response) => {
                setDataCollectibles(response.data.data);
            });
    }, []);
    console.log(dataCollectibles); */
  <Wrapper>
    <SEO pageTitle="Product Details" />
    <Header />
    <main id="main-content">
      <Breadcrumb pageTitle="Product Details" currentPage="Product Details" />
      {product && <ProductDetailsArea product={product} bids={bids} />}

      <ProductArea
        data={{
          section_title: { title: "Related Item" },
          products: recentViewProducts
        }}
      />
      {/*
                <ProductArea
                    data={{
                        section_title: { title: "Related Item" },
                        products: relatedProducts,
                    }}
                /> */}
    </main>
    <Footer />
  </Wrapper>
);
export async function getStaticPaths() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/?populate=*`);
  const productData = await res.json();
  return {
    paths: productData.data.map(({ slug }) => ({
      params: {
        slug
      }
    })),
    fallback: false,
    // Re-generate the post at most once per second
    // if a request comes in
    revalidate: 1,
  };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/?populate=*`);
  const productData = await res.json();
  const product = productData.data.find(({ slug }) => slug === params.slug);
  let bids = null;

  if (product) {
    // Get All Bids
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections/${product.collection?.data?.id}?populate[0]=paymentTokens`
    );
    const collection = await response.json();
    product.collection.data.paymentTokens = collection.data.paymentTokens;
  }
  if (product.putOnSale) {
    // Get All Bids
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auctions/${product.auction?.data?.id}?populate=*`
    );
    const auction = await response.json();
    if (auction?.data?.biddings?.data)
      bids = auction?.data?.biddings?.data;
    if (auction?.data?.paymentToken)
      product.auction.data.paymentToken = auction?.data?.paymentToken;
  }
  const recentViewProducts = shuffleArray(productData.data).slice(0, 5);
  const relatedProducts = [];
  /* const relatedProducts = productData.data
        .filter((prod) =>
            prod.collection.category?.some((r) => category?.includes(r))
        )
        .slice(0, 5);
    console.log(relatedProducts); */
  return {
    props: {
      className: "template-color-1",
      product,
      bids,
      recentViewProducts,
      relatedProducts
    } // will be passed to the page component as props
  };
}

ProductDetails.propTypes = {
  product: PropTypes.shape({}),
  recentViewProducts: PropTypes.arrayOf(PropTypes.shape({})),
  bids: PropTypes.arrayOf(PropTypes.shape({}))
};

export default ProductDetails;

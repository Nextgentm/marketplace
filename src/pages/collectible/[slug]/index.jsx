import PropTypes from "prop-types";
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ProductDetailsArea from "@containers/product-details";
import AuctionArea from "@containers/auction-area";
import ProductArea from "@containers/product/layout-03";
import { shuffleArray } from "@utils/methods";
import strapi from "@utils/strapi";

const ProductDetails = ({ product, bids, recentViewProducts, relatedProducts }) => (

  <Wrapper>
    <SEO pageTitle="Product Details" />
    <Header />
    <main id="main-content">
      <Breadcrumb pageTitle="Product Details" currentPage="Product Details" />
      {product && <ProductDetailsArea product={product} bids={bids} />}

      <AuctionArea
        data={{
          section_title: { title: "Related Item" },
          auctions: recentViewProducts.data
        }}
      />

    </main>
    <Footer />
  </Wrapper>
);
export async function getStaticPaths() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/?populate=*`);
  const productData = await res.json();
  const path = productData.data.map(({ slug }) => ({
    params: {
      slug
    }
  }));
  return {
    paths: [...path],
    fallback: "blocking"
  };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles?filters[slug][$eq]=${params.slug}&populate=*`);
  const productData = await res.json();
  const product = productData.data[0] || null;
  let bids = null;

  if (product) {
    // Get All payment tokens
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections/${product.collection?.data?.id}?populate[0]=paymentTokens`
    );
    const collection = await response.json();
    product.collection.data.paymentTokens = collection.data.paymentTokens;

    // get owner histories
    let collectible = await strapi.findOne("collectibles", product.id, {
      populate: ["owner_histories"],
    });
    // console.log(product.id);
    product.owner_histories = collectible.data.owner_histories;

    if (product.putOnSale) {
      // Get All auction and biddings data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auctions/${product.auction?.data[0]?.id}?populate=*`
      );
      const auction = await response.json();
      // console.log(auction);
      bids = auction.data?.biddings?.data;
      product.auction.data.paymentToken = auction.data?.paymentToken;
    }
  }

  const filter = {
    filters: {
      id: {
        $ne: params.id
      },
      status: {
        $eq: "Live"
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
      limit: 5
    }
  }
  const recentViewProducts = await strapi.find("auctions", filter);
  // const recentViewProducts = shuffleArray(remaningProducts.data).slice(0, 5);
  const relatedProducts = [];
  return {
    props: {
      className: "template-color-1",
      product,
      bids,
      recentViewProducts,
      relatedProducts
    },
    revalidate: 1, // In seconds
  };
}

ProductDetails.propTypes = {
  product: PropTypes.shape({}),
  recentViewProducts: PropTypes.arrayOf(PropTypes.shape({})),
  bids: PropTypes.arrayOf(PropTypes.shape({}))
};

export default ProductDetails;

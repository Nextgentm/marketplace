import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import { useBreadCrumbData } from "@hooks";

const ProductDetails = ({ product, bids, recentViewProducts, relatedProducts }) => {
  //   const [extraCrumb, setExtraCrumb] = useState([]);
  //   const router = useRouter();

  //   useEffect(() => {
  //     const routeArr = router.asPath.split("/");
  //     const mainPath = routeArr[1];
  //     const crumbArr = [];
  //     let collectionName = "";
  //     if (mainPath === "collectible" && routeArr.length > 2) {
  //       collectionName = routeArr[2];

  //       let crumbData = {};
  //       crumbData["name"] = "Collection";
  //       crumbData["path"] = `/collection`;
  //       crumbArr.push(crumbData);

  //       crumbData = {};
  //       crumbData["name"] = product.collection?.data?.name;
  //       crumbData["path"] = `/collection/${product.collection?.data?.slug}`;
  //       crumbArr.push(crumbData);

  //       crumbData = {};
  //       crumbData["name"] = collectionName;
  //       crumbData["path"] = `/collectible/${collectionName}`;
  //       crumbArr.push(crumbData);
  //     }

  //     setExtraCrumb(crumbArr);
  //   }, []);

  const extraCrumb = useBreadCrumbData(product.collection?.data?.name, product.collection?.data?.slug, product?.name);

  return (
    <Wrapper>
      <SEO pageTitle={product?.name} slug={"collectible/" + product?.slug} />
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle="Product Details" currentPage="Product Details" extraCrumb={extraCrumb} />
        {product && <ProductDetailsArea product={product} bids={bids} />}

        {recentViewProducts?.data?.length > 0 && (
          <AuctionArea
            data={{
              section_title: { title: "Related Item" },
              auctions: recentViewProducts.data
            }}
            collectiblePage={true}
          />
        )}
      </main>
      <Footer />
    </Wrapper>
  );
};

export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles?filters[slug][$eq]=${params.slug}&populate=*`
    );
    const productData = await res.json();
    const product = productData.data[0] || null;
    let bids = [];

    if (product) {
      // Get All payment tokens
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections/${product.collection?.data?.id}?populate[0]=paymentTokens`
      );
      const collection = await response.json();
      product.collection.data.paymentTokens = collection.data.paymentTokens;

      // get owner histories
      let collectible = await strapi.findOne("collectibles", product.id, {
        populate: ["owner_histories"]
      });
      // console.log(product.id);
      product.owner_histories = collectible.data.owner_histories;

      // if (product.putOnSale) {
      //   // Get All auction and biddings data
      //   const response = await fetch(
      //     `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auctions/${product.auction?.data[0]?.id}?populate=*`
      //   );
      //   const auction = await response.json();
      //   // console.log(auction);
      //   if (auction.data) {
      //     bids = auction.data?.biddings?.data;
      //     product.auction.data.paymentToken = auction.data?.paymentToken;
      //   }
      // }
    }

    const filter = {
      filters: {
        status: {
          $eq: "Live"
        },
        collectible: {
          id: {
            $ne: product.id
          },
          collection: {
            id: product.collection?.data?.id
          }
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
    };
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
      }
    };
  } catch (er) {
    return {
      redirect: {
        destination: "/collectibles"
      }
    };
  }
}

ProductDetails.propTypes = {
  product: PropTypes.shape({}),
  recentViewProducts: PropTypes.arrayOf(PropTypes.shape({})),
  bids: PropTypes.arrayOf(PropTypes.shape({}))
};

export default ProductDetails;
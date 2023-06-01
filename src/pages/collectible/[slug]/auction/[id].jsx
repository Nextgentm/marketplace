import PropTypes from "prop-types";
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import AuctionDetailsArea from "@containers/auction-details";
import AuctionArea from "@containers/auction-area";
import { shuffleArray } from "@utils/methods";
import { GET_AUCTION_DATA_BY_ID_QUERY, ALL_AUCTION_LISTDATA_QUERY } from "../../../../graphql/query/auctions/getAuctions";
import client from "@utils/apollo-client";
import strapi from "@utils/strapi";

const AuctionDetails = ({ auction, recentViewProducts }) => (

  <Wrapper>
    <SEO pageTitle="Product Details" />
    <Header />
    <main id="main-content">
      <Breadcrumb pageTitle="Product Details" currentPage="Product Details" />
      {auction && <AuctionDetailsArea auctionData={auction} />}

      {recentViewProducts?.data.length > 0 &&
        <AuctionArea
          data={{
            section_title: { title: "Related Item" },
            auctions: recentViewProducts.data,
          }}
        />
      }
    </main>
    <Footer />
  </Wrapper>
);
export async function getStaticPaths() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auctions?populate[0]=collectible`);//?filters[id]=${id}
    const productData = await res.json();
    const path = productData.data.map((product) => ({
      params: {
        id: product.id.toString(),
        slug: product.collectible.data.slug
      }
    }));
    return {
      paths: [...path],
      fallback: "blocking"
    };
  } catch (er) {
    return { paths: [], fallback: false } // <- ADDED RETURN STMNT
  }
}

export async function getStaticProps({ params }) {
  let auction = await strapi.findOne("auctions", params.id, {
    populate: ["collectible", "paymentToken", "biddings"],
  });
  // console.log(auction);

  let collectible = await strapi.findOne("collectibles", auction.data.collectible.data.id, {
    // populate: ["owner_histories", "image", "collectibleProperties", "collection"],
    populate: {
      owner_histories: { populate: "*" },
      image: { populate: "*" },
      collectibleProperties: { populate: "*" },
      collection: { populate: ["paymentTokens"] },
    }
  });
  auction.data.collectible = collectible;
  // console.log(collectible);

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
  let recentViewProducts = await strapi.find("auctions", filter);
  // console.log(recentViewProducts);

  const relatedProducts = [];
  return {
    props: {
      className: "template-color-1",
      auction,
      recentViewProducts,
      relatedProducts
    },
    revalidate: 1, // In seconds
  };
}

AuctionDetails.propTypes = {
  auction: PropTypes.shape({}),
  recentViewProducts: PropTypes.arrayOf(PropTypes.shape({})),
};

export default AuctionDetails;

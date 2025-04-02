import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
import PropTypes from "prop-types";
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import AuctionDetailsArea from "@containers/auction-details";
import AuctionArea from "@containers/auction-area";
import { shuffleArray } from "@utils/methods";
import {
  GET_AUCTION_DATA_BY_ID_QUERY,
  ALL_AUCTION_LISTDATA_QUERY
} from "../../../../graphql/query/auctions/getAuctions";
import client from "@utils/apollo-client";
import strapi from "@utils/strapi";
import { useBreadCrumbData } from "@hooks";
import { NETWORK_NAMES } from "@utils/constants";

const AuctionDetails = ({ auction, recentViewProducts }) => {
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
  //       crumbData["name"] = auction?.data?.collectible?.data?.collection?.data?.name;
  //       crumbData["path"] = `/collection/${auction?.data?.collectible?.data?.collection?.data?.slug}`;
  //       crumbArr.push(crumbData);

  //       crumbData = {};
  //       crumbData["name"] = collectionName;
  //       crumbData["path"] = `/collectible/${collectionName}`;
  //       crumbArr.push(crumbData);
  //     }

  //     setExtraCrumb(crumbArr);
  //   }, []);

  const extraCrumb = useBreadCrumbData(
    auction?.data?.collectible?.data?.collection?.data?.name,
    auction?.data?.collectible?.data?.collection?.data?.slug,
    auction?.data?.collectible.data?.name
  );

  return (
    <Wrapper>
      <SEO pageTitle={auction?.data?.collectible?.data?.name} slug={"collectible/" + auction?.data?.collectible?.data?.slug + "/auction/" + auction?.data?.id} />
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle="Product Details" currentPage="Product Details" extraCrumb={extraCrumb} />
        {auction && <AuctionDetailsArea auctionData={auction} />}

        {recentViewProducts?.data.length > 0 && (
          <AuctionArea
            data={{
              section_title: { title: "Related Item" },
              auctions: recentViewProducts.data
            }}
          />
        )}
      </main>
      <Footer />
    </Wrapper>
  );
};

export async function getServerSideProps({ params }) {
  try {
    let auction = await strapi.findOne("auctions", params.id, {
      populate: ["collectible", "paymentToken", "biddings"]
    });
    // console.log(auction);

    let collectible = await strapi.findOne("collectibles", auction.data.collectible.data.id, {
      // populate: ["owner_histories", "image", "collectibleProperties", "collection"],
      populate: {
        owner_histories: { populate: "*" },
        image: { populate: "*" },
        collectibleProperties: { populate: "*" },
        collection: { populate: ["paymentTokens"] }
      }
    });
    if (params.slug !== collectible.data.slug) {
      return {
        redirect: {
          destination: "/collectible/" + params.slug
        }
      };
    }
    auction.data.collectible = collectible;
    // console.log(collectible);

    const filter = {
      filters: {
        id: {
          $ne: params.id
        },
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
        blockchain: { $eq: NETWORK_NAMES.NETWORK },
        collectible: {
          collection: {
            id: auction.data?.collectible?.data?.collection?.data?.id
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
    let recentViewProducts = await strapi.find("auctions", filter);
    // console.log(recentViewProducts);

    const relatedProducts = [];
    return {
      props: {
        className: "template-color-1",
        auction,
        recentViewProducts,
        relatedProducts
      }
    };
  } catch (er) {
    return {
      redirect: {
        destination: "/collectible/" + params.slug
      }
    };
  }
}

AuctionDetails.propTypes = {
  auction: PropTypes.shape({}),
  recentViewProducts: PropTypes.arrayOf(PropTypes.shape({}))
};

export default AuctionDetails;
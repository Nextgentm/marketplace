import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import HeroArea from "@containers/hero/layout-06";
import CollectionArea from "@containers/collection/layout-01";
import ExploreProductArea from "@containers/explore-product/layout-02";
import CreatorArea from "@containers/creator/layout-01";
import ServiceArea from "@containers/services/layout-01";
import { normalizedData } from "@utils/methods";

// Demo data
import { useState, useEffect } from "react";
import axios from "axios";
import homepageData from "../data/homepages/home-06.json";
import sellerData from "../data/sellers.json";
import productData from "../data/products.json";

export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const Home = () => {
  const content = normalizedData(homepageData?.content || []);
  const [dataCollection, setDataCollection] = useState(null);
  const [dataCollectibles, setDataCollectibles] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections?populate=*`).then((response) => {
      setDataCollection(response.data.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles?populate=*`).then((response) => {
      setDataCollectibles(response.data.data);
    });
  }, []);

  console.log(dataCollectibles);

  return (
    <Wrapper>
      <SEO pageTitle="NFT Marketplace" />
      <Header />
      <main id="main-content">
        <HeroArea data={content["hero-section"]} />

        <CollectionArea
          data={
            dataCollection && {
              ...content["collection-section"],
              collections: dataCollection.slice(0, 4)
            }
          }
        />
        <ExploreProductArea
          data={
            dataCollectibles && {
              ...content["explore-product-section"],
              products: dataCollectibles
            }
          }
        />
        {/* <CreatorArea
          data={{
            ...content["top-sller-section"],
            creators: sellerData
          }}
        /> */}
        {/* <ServiceArea data={content["service-section"]} /> */}
      </main>
      <Footer />
    </Wrapper>
  );
};

export default Home;

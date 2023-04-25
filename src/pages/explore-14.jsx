import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-10";

// Demo data
import { useState, useEffect } from "react";
import axios from "axios";
import productData from "../data/products.json";

export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const Explore14 = () => {
  const [dataCollectibles, setDataCollectibles] = useState(null);
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles?populate=*`).then((response) => {
      setDataCollectibles(response.data.data);
    });
  }, []);
  return (
    <Wrapper>
      <SEO pageTitle="Explore Simple" />
      <Header />
      <main id="main-content">
        <Breadcrumb pageTitle="Explore NFT" currentPage="Explore NFT" />
        {dataCollectibles && (
          <ExploreProductArea
            data={{
              section_title: {
                title: "Find Your Non Replaceable Token"
              },
              products: dataCollectibles,
              placeBid: true
            }}
          />
        )}
      </main>
      <Footer />
    </Wrapper>
  );
};
export default Explore14;

import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import HeroArea from "@containers/hero/layout-06";
import CollectionArea from "@containers/collection/layout-01";
import ExploreProductArea from "@containers/explore-product/layout-02";
import CreatorArea from "@containers/creator/layout-01";
import ServiceArea from "@containers/services/layout-01";
import { normalizedData } from "@utils/methods";

// Demo data
import homepageData from "../data/homepages/home-06.json";
import sellerData from "../data/sellers.json";
import productData from "../data/products.json";
import collectionsData from "../data/collections.json";

import { useState,useEffect  } from "react";
import axios from "axios";



export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Home = () => {
    const content = normalizedData(homepageData?.content || []);
    const [dataCollection, setDataCollection] = useState(null);
    useEffect(() => {
        axios.get( `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections?populate=*`).then((response) => {
            setDataCollection(response.data.data);
            
        });
    }, []);
    
    return (
        <Wrapper>
            <SEO pageTitle="NFT Marketplace" />
            <Header />
            <main id="main-content">
                <HeroArea data={content["hero-section"]} />
                
                <CollectionArea
                    data={dataCollection && {
                        ...content["collection-section"],
                        collections: dataCollection.slice(0,4),
                    }}
                />
                <ExploreProductArea
                    data={{
                        ...content["explore-product-section"],
                        products: productData,
                    }}
                />
                <CreatorArea
                    data={{
                        ...content["top-sller-section"],
                        creators: sellerData,
                    }}
                />
                <ServiceArea data={content["service-section"]} />
            </main>
            <Footer />
        </Wrapper>
    );
};

export default Home;

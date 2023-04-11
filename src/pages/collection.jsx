import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import CollectionArea from "@containers/collection/layout-03";

// demo data

import { useState, useEffect } from "react";
import axios from "axios";
import collectionsData from "../data/collections.json";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Collection = () => {
    const [dataCollection, setDataCollection] = useState(null);
    useEffect(() => {
        axios
            .get(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections?populate=*`
            )
            .then((response) => {
                setDataCollection(response.data.data);
            });
    }, []);
    // console.log(dataCollection);
    return (
        <Wrapper>
            <SEO pageTitle="Collection" />
            <Header />
            <main id="main-content">
                <Breadcrumb
                    pageTitle="Our Collection"
                    currentPage="Collection"
                />
                {dataCollection && (
                    <CollectionArea
                        data={
                            dataCollection
                                ? { collections: dataCollection }
                                : { collections: collectionsData }
                        }
                    />
                )}
            </main>
            <Footer />
        </Wrapper>
    );
};

export default Collection;

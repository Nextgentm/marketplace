import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import AuthorIntroArea from "@containers/author-intro";
import AuthorProfileArea from "@containers/author-profile";
import { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import client from "@utils/apollo-client";
import { WalletData } from "../context/wallet-context";
import { ALL_COLLECTION_QUERY } from "../graphql/query/collection/getCollection";

// Demo data
import authorData from "../data/author.json";
// import productData from "../data/products.json";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Author = () => {
    const [allProductsData, setAllProductsData] = useState(null);
    const { walletData, setWalletData } = useContext(WalletData);

    useEffect(() => {
        if (walletData.isConnected) {
            getAllCollectionsData();
        } else {
            setAllProductsData(null);
            toast.error("Please connect wallet first");
        }
    }, [walletData.isConnected]);

    const getAllCollectionsData = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/?populate=image&filter[owner][$eq]=${walletData.account}`
        );
        const productData = await res.json();
        console.log(productData.data);
        setAllProductsData(productData.data);
    };

    return (
        <Wrapper>
            <SEO pageTitle="Author" />
            <Header />
            <main id="main-content">
                <AuthorIntroArea data={authorData} />
                <AuthorProfileArea productData={allProductsData} />
            </main>
            <Footer />
        </Wrapper>
    );
};

export default Author;

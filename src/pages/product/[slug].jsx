import PropTypes from "prop-types";
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
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

const ProductDetails = ({ product, recentViewProducts, relatedProducts }) => (
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
            <Breadcrumb
                pageTitle="Product Details"
                currentPage="Product Details"
            />
            {product && <ProductDetailsArea product={product} />}

            <ProductArea
                data={{
                    section_title: { title: "Related Item" },
                    products: recentViewProducts,
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
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/?populate=*`
    );
    const productData = await res.json();
    return {
        paths: productData.data.map(({ slug }) => ({
            params: {
                slug,
            },
        })),
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/?populate=*`
    );
    const productData = await res.json();
    const product = productData.data.find(({ slug }) => slug === params.slug);
    product.bids = {
        data: [
            {
                id: 7,
                walletAddress: "0xd14bebf277c671ee22ed433e67f36ca38ec5a0e5",
                bidPrice: 20,
                priceCurrency: "wETH",
                startTimestamp: "2023-04-22",
                endTimeStamp: "2023-04-29",
                sellType: "Bidding",
                createdAt: "2023-04-22T13:00:22.773Z",
            },
        ],
    };
    // const { category } = product.collection.data;
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
            recentViewProducts,
            relatedProducts,
        }, // will be passed to the page component as props
    };
}

ProductDetails.propTypes = {
    product: PropTypes.shape({}),
    recentViewProducts: PropTypes.arrayOf(PropTypes.shape({})),
    relatedProducts: PropTypes.arrayOf(PropTypes.shape({})),
};

export default ProductDetails;

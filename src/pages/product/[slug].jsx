import PropTypes from "prop-types";
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ProductDetailsArea from "@containers/product-details";
import ProductArea from "@containers/product/layout-03";
import { shuffleArray } from "@utils/methods";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";

// demo data
import productData from "../../data/products.json";

const ProductDetails = ({ product, recentViewProducts, relatedProducts }) => {
    const router = useRouter();
    console.log(router.query.slug);
    const [dataCollectibles, setDataCollectibles] = useState(null);
    useEffect(() => {
        axios
            .get(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles/3?populate=*`
            )
            .then((response) => {
                setDataCollectibles(response.data.data);
            });
    }, []);
    console.log(dataCollectibles);
    return (
        <Wrapper>
            <SEO pageTitle="Product Details" />
            <Header />
            <main id="main-content">
                <Breadcrumb
                    pageTitle="Product Details"
                    currentPage="Product Details"
                />
                {dataCollectibles && (
                    <ProductDetailsArea product={dataCollectibles} />
                )}

                <ProductArea
                    data={{
                        section_title: { title: "Recent View" },
                        products: recentViewProducts,
                    }}
                />
                <ProductArea
                    data={{
                        section_title: { title: "Related Item" },
                        products: relatedProducts,
                    }}
                />
            </main>
            <Footer />
        </Wrapper>
    );
};

export async function getStaticPaths() {
    return {
        paths: productData.map(({ slug }) => ({
            params: {
                slug,
            },
        })),
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const product = productData.find(({ slug }) => slug === params.slug);
    const { categories } = product;
    const recentViewProducts = shuffleArray(productData).slice(0, 5);
    const relatedProducts = productData
        .filter((prod) => prod.categories?.some((r) => categories?.includes(r)))
        .slice(0, 5);
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

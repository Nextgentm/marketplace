import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import CreateNewArea from "@containers/create-new";
import strapi from "@utils/strapi";
import { NETWORK_NAMES } from "@utils/constants";

const EditCollectible = ({ collectible }) => (
    <Wrapper>
        <SEO pageTitle="Update" />
        <Header />
        <main id="main-content">
            <Breadcrumb pageTitle="Update File" />
            <CreateNewArea
                collectible={collectible}
            />
        </main>
        <Footer />
    </Wrapper>
);

export async function getStaticPaths() {
    try {
        let productData = [];
        let page = 1, pageCount = 1, pageSize = 25;
        do {
            // console.log(page, pageCount, pageSize);
            const resData = await strapi.find("collectibles", {
                fields: ["id", "slug"],
                filters: {
                    blockchain: { $eq: NETWORK_NAMES.NETWORK } // Added blockchain filter
                },
                pagination: {
                    page: page,
                    pageSize: pageSize
                }
            });
            productData = productData.concat(resData.data);
            page++;
            pageCount = resData.meta.pagination.pageCount;
        } while (page <= pageCount);
        // console.log(productData);

        return {
            paths: productData.map(({ slug }) => ({
                params: {
                    slug
                }
            })),
            fallback: false
        };
    } catch (er) {
        return { paths: [], fallback: false } // <- ADDED RETURN STMNT
    }
}

export async function getStaticProps({ params }) {

    let collectible = await strapi.find("collectibles", {
        filters: {
            blockchain: { $eq: NETWORK_NAMES.NETWORK }, // Added blockchain filter
            slug: {
                $eq: params.slug
            },
        },
        populate: "*",
    });

    return {
        props: {
            className: "template-color-1",
            collectible: collectible.data[0]

        } // will be passed to the page component as props
    };
}

export default EditCollectible;

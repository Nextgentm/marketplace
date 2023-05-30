import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import CreateNewArea from "@containers/create-new";
import strapi from "@utils/strapi";

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collectibles`);
        const productData = await res.json();
        return {
            paths: productData.data.map(({ slug }) => ({
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

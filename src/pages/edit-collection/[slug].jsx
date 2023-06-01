import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import CreateCollectionArea from "@containers/create-collection";
import strapi from "@utils/strapi";

const EditCollection = ({ collection }) => (
    <Wrapper>
        <SEO pageTitle="Update Collection" />
        <Header />
        <main id="main-content">
            <Breadcrumb pageTitle="Update Collection" currentPage="Update Collection" />
            <CreateCollectionArea
                collection={collection}
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
            const resData = await strapi.find("collections", {
                fields: ["id", "slug"],
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

    let collection = await strapi.find("collections", {
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
            collection: collection.data[0]

        } // will be passed to the page component as props
    };
}

export default EditCollection;

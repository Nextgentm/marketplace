import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import CollectionArea from "@containers/collection/layout-03";
import { ALL_COLLECTION_QUERY } from "src/graphql/query/collection/getCollection";
import client from "@utils/apollo-client";

const Collection = (props) => (
    <Wrapper>
        <SEO pageTitle="Collection" />
        <Header />
        <main id="main-content">
            <Breadcrumb pageTitle="Our Collection" currentPage="Collection" />
            <CollectionArea data={props.data} />
        </main>
        <Footer />
    </Wrapper>
);

export const getStaticProps = async () => {
    const { data } = await client.query({
        query: ALL_COLLECTION_QUERY,
        variables: {
            pagination: {
                pageSize: 5,
            },
        },
    });
    return {
        props: {
            className: "template-color-1",
            data,
        },
    };
};
export default Collection;

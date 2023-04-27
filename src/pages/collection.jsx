import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
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
      <CollectionArea {...props} />
    </main>
    <Footer />
  </Wrapper>
);

Collection.getInitialProps = async () => {
  const { data } = await client.query({
    query: ALL_COLLECTION_QUERY,
    variables: {
      pagination: {
        pageSize: 5
      }
    },
    fetchPolicy: "network-only"
  });
  return {
    className: "template-color-1",
    data
  };
};

export default Collection;

import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import CollectionArea from "@containers/collection/layout-03";
import { GET_COLLECTION_LISTDATA_QUERY } from "src/graphql/query/collection/getCollection";
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
    query: GET_COLLECTION_LISTDATA_QUERY,
    variables: {
      filters: {
        collectibles: {
          putOnSale: {
            eq: true
          }
        }
      },
      collectiblesFilters: {
        putOnSale: {
          eq: true
        }
      },
      pagination: {
        pageSize: 8
      }
    },
    fetchPolicy: "network-only"
  });
  return {
    className: "template-color-1",
    data: data.collections.data
  };
};

export default Collection;

import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import CollectionArea from "@containers/collection/layout-03";
import { GET_COLLECTION_LISTDATA_QUERY } from "src/graphql/query/collection/getCollection";
import client from "@utils/apollo-client";
import { getCollection } from "src/services/collections/collection";
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
  const data = await getCollection({
    filters: {
      collectibles: {
        auction: {
          status: "Live"
        }
      }
    },
    populate: {
      collectibles: {
        fields: "*",
        populate: {
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              id: { $notNull: true }
            }
          }
        }
      },
      cover: {
        fields: "*"
      },
      logo: {
        fields: "*"
      }
    },
    pagination: {
      limit: 8,
      start: 0,
      withCount: true
    }
  });
  return {
    className: "template-color-1",
    data: data
  };
};

export default Collection;

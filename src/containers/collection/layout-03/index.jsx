import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Collection from "@components/collection";
import Pagination from "@components/pagination-02";
import { CollectionType } from "@utils/types";
import { normalize, normalizedData } from "@utils/methods";
import { useLazyQuery } from "@apollo/client";
import { ALL_COLLECTION_QUERY, GET_COLLECTION_LISTDATA_QUERY } from "src/graphql/query/collection/getCollection";
import _ from "lodash";

const CollectionArea = ({ className, space, id, data }) => {
  const [collectionsRecords, setCollectionsRecords] = useState([]);
  const [collectionsData, setCollectionsData] = useState();
  const [pagination, setPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 0,
    total: 0
  });
  useEffect(() => {
    if (data) {
      setCollectionsData(data);
    }
  }, [data]);

  const [getCollection, { data: collectionApiData, error }] = useLazyQuery(GET_COLLECTION_LISTDATA_QUERY, {
    fetchPolicy: "cache-and-network"
  });

  useEffect(() => {
    getCollection({
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
          },
          id: { notNull: true }
        },
        pagination: {
          pageSize: 4
        }
      }
    });
  }, []);

  useEffect(() => {
    console.log("error", error);
    if (collectionApiData?.collections) {
      setPagination(collectionApiData?.collections?.meta?.pagination);
      setCollectionsData(collectionApiData.collections?.data);
    }
  }, [collectionApiData, error]);

  // const setCollectionsData = ({ collections }) => {
  //   setPagination(collections.meta.pagination);
  //   setCollectionsRecords(collections); //normalize(collections));
  // };

  const getCollectionPaginationRecord = (page) => {
    getCollection({
      variables: {
        filters: {
          collectibles: {
            putOnSale: {
              eq: true
            }
          },
          id: { notNull: true }
        },
        collectiblesFilters: {
          putOnSale: {
            eq: true
          }
        },
        pagination: { page, pageSize: 4 }
      }
    });
  };

  return (
    <div className={clsx("rn-collection-area", space === 1 && "rn-section-gapTop", className)} id={id}>
      <div className="container">
        {collectionsData && (
          <div className="row g-5">
            {collectionsData.map((collection) => (
              <div key={collection.id} className="col-lg-6 col-xl-3 col-md-6 col-sm-6 col-12">
                <Collection
                  title={collection?.attributes.name}
                  total_item={collection?.attributes?.collectibles?.data?.length}
                  path={`collectibles?collection=${collection?.attributes.name}`}
                  image={collection?.attributes.cover?.data?.attributes}
                  thumbnails={collection?.attributes.featured?.data?.attributes}
                  profile_image={collection?.attributes.logo?.data?.attributes}
                />
              </div>
            ))}
          </div>
        )}
        <div className="row">
          <div className="col-lg-12" data-sal="slide-up" data-sal-delay="950" data-sal-duration="800">
            {pagination?.pageCount > 1 ? (
              <Pagination
                className="single-column-blog"
                currentPage={pagination.page}
                numberOfPages={pagination.pageCount}
                onClick={getCollectionPaginationRecord}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

CollectionArea.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  space: PropTypes.oneOf([1]),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string,
      attributes: CollectionType
    })
  ).isRequired
};
CollectionArea.defaultProps = {
  space: 1
};

export default CollectionArea;

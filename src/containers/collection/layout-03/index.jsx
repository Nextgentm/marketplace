import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Collection from "@components/collection";
import Pagination from "@components/pagination-02";
import { CollectionType } from "@utils/types";
import { normalize } from "@utils/methods";
import { useLazyQuery } from "@apollo/client";
import { ALL_COLLECTION_QUERY } from "src/graphql/query/collection/getCollection";
import _ from "lodash";

const CollectionArea = ({ className, space, id, data }) => {
  // console.log("className", className);
  const [collectionsRecords, setCollectionsRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 0,
    total: 0
  });

  const [getCollection, { data: collectionPagination, error }] = useLazyQuery(ALL_COLLECTION_QUERY, {
    fetchPolicy: "cache-and-network"
  });

  useEffect(() => {
    if (data?.collections) {
      setCollectionsData(data);
    }
  }, [data]);

  useEffect(() => {
    console.log("error", error);
    console.log("collectionPagination", collectionPagination);
    if (collectionPagination?.collections) {
      setCollectionsData(collectionPagination);
    }
  }, [collectionPagination, error]);

  const setCollectionsData = ({ collections }) => {
    setCollectionsRecords(collections);//normalize(collections));
    setPagination(collections.meta.pagination);
  };

  const getCollectionPaginationRecord = (page) => {
    getCollection({
      variables: { pagination: { page, pageSize: 8 } }
    });
  };
  return (
    <div className={clsx("rn-collection-area", space === 1 && "rn-section-gapTop", className)} id={id}>
      <div className="container">
        {data && (
          <div className="row g-5">
            {data.map((collection) => (
              <div key={collection.id} className="col-lg-6 col-xl-3 col-md-6 col-sm-6 col-12">
                <Collection
                  title={collection?.attributes.name}
                  total_item={collection?.attributes?.collectibles?.data?.length}
                  path={`collection/${collection?.attributes.slug}`}
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
            <Pagination
              currentPage={pagination.page}
              numberOfPages={pagination.pageCount}
              onClick={getCollectionPaginationRecord}
            />
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
  data: PropTypes.shape({
    collections: PropTypes.arrayOf(CollectionType)
  })
};
CollectionArea.defaultProps = {
  space: 1
};

export default CollectionArea;

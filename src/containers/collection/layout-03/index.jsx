import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Collection from "@components/collection";
import Pagination from "@components/pagination-02";
import { CollectionType } from "@utils/types";
import { normalize, normalizedData } from "@utils/methods";
import { useLazyQuery } from "@apollo/client";
import { ALL_COLLECTION_QUERY, GET_COLLECTION_LISTDATA_QUERY } from "src/graphql/query/collection/getCollection";
import _ from "lodash";
import { getCollection } from "src/services/collections/collection";

const CollectionArea = ({ className, space, id, data }) => {
  // console.log("data data ", data);
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
      setCollectionData(data);
    }
  }, [data]);

  const setCollectionData = (data, page = 1) => {
    // console.log("data123465", Math.ceil(data.meta.pagination.total / 8));
    setCollectionsData(data.data);
    setPagination({ ...data.meta.pagination, pageCount: Math.ceil(data.meta.pagination.total / 8), page });
  };

  const getCollectionPaginationRecord = async (page) => {
    const start = page * 8 - 8;
    const limit = 8;

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
        start,
        limit
      }
    });

    setCollectionData(data, page);
  };

  // const getCollectionPaginationRecord = (page) => {
  //   getCollection({
  //     variables: {
  //       filters: {
  //         collectibles: {
  //           putOnSale: {
  //             eq: true
  //           }
  //         },
  //         id: { notNull: true }
  //       },
  //       collectiblesFilters: {
  //         putOnSale: {
  //           eq: true
  //         }
  //       },
  //       pagination: { page, pageSize: 8 }
  //     }
  //   });
  // };
  const getTotal = useCallback((collection) => {
    let total = 0;
    total = +collection.collectibles.data.reduce((acc, cur) => acc + cur.auction?.data?.length, 0);
    return total;
  }, []);

  return (
    <div className={clsx("rn-collection-area", space === 1 && "rn-section-gapTop", className)} id={id}>
      <div className="container">
        {collectionsData && (
          <div className="row g-5">
            {/* {console.log("collectionsData", collectionsData)} */}
            {collectionsData.map((collection) =>
              collection?.collectibles?.data?.length ? (
                <div key={collection.id} className="col-lg-6 col-xl-3 col-md-6 col-sm-6 col-12">
                  <Collection
                    title={collection?.name}
                    total_item={getTotal(collection)}
                    path={`collectibles?collection=${collection?.name}`}
                    image={collection?.cover?.data}
                    thumbnails={collection?.featured?.data}
                    profile_image={collection?.logo?.data}
                  />
                </div>
              ) : null
            )}
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
  data: PropTypes.shape({
    data: PropTypes.arrayOf(CollectionType).isRequired
  })
};
CollectionArea.defaultProps = {
  space: 1
};

export default CollectionArea;

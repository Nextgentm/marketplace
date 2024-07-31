import { useState, useEffect, useCallback, useContext } from "react";
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
import { AppData } from "src/context/app-context";
import { addressIsAdmin } from "src/lib/BlokchainHelperFunctions";
import { Button, Spinner } from "react-bootstrap";

const CollectionArea = ({ className, space, id, data }) => {
  // console.log("data data ", data);
  const { walletData, setWalletData } = useContext(AppData);

  const [isAdminWallet, setIsAdminWallet] = useState(false);
  useEffect(() => {
    if (walletData.isConnected) {
      addressIsAdmin(walletData).then((validationValue) => {
        setIsAdminWallet(validationValue);
      }).catch((error) => { console.log("Error while factory call " + error) });
    } else {
      setIsAdminWallet(false);
    }
  }, [walletData]);

  const [collectionsRecords, setCollectionsRecords] = useState([]);
  const [collectionsData, setCollectionsData] = useState();
  const [pagination, setPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setCollectionData(data);
    }
  }, [data]);

  const setCollectionData = (data, page = 1, loadmore) => {
    if (loadmore && collectionsData) {
      setCollectionsData([...collectionsData, ...data.data]);
    } else {
      setCollectionsData(data.data);
    }
    setPagination({ ...data.meta.pagination, pageCount: Math.ceil(data.meta.pagination.total / 8), page });
  };

  const getCollectionPaginationRecord = async (page) => {
    const start = page * 8 - 8;
    const limit = 8;
    setLoading(true);
    const data = await getCollection({
      filters: {
        $or: [{
          collectibles: {
            auction: {
              status: "Live"
            },
            endTimeStamp: {
              $gt: new Date()
            },
          }
        }, {
          isOpenseaCollection: true
        }]
      },
      sort: ["priority:asc"],
      populate: {
        collectibles: {
          fields: "*",
          filters: {
            auction: {
              status: "Live",
              endTimeStamp: {
                $gt: new Date()
              },
              id: { $notNull: true }
            }
          },
          populate: {
            auction: {
              fields: "*",
              filters: {
                status: "Live",
                endTimeStamp: {
                  $gt: new Date()
                },
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
    setLoading(false);
    setCollectionData(data, page, true);
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
  // const getTotal = useCallback((collection) => {
  //   let total = 0;
  //   total = +collection.collectibles.data.reduce((acc, cur) => acc + cur.auction?.data?.length, 0);
  //   return total;
  // }, []);

  return (
    <div className={clsx("rn-collection-area", space === 1 && "rn-section-gapTop", className)} id={id}>
      <div className="container">
        {collectionsData ? (
          <div className="row g-5">
            {collectionsData.length > 0 ? collectionsData.map((collection) =>
              collection?.collectibles?.data?.length ? (
                <div key={collection.id} className="col-lg-6 col-xl-3 col-md-6 col-sm-6 col-12">
                  <Collection
                    title={collection?.name}
                    total_item={collection?.collectibles?.data?.length}
                    path={`collection/${collection?.slug}`}
                    image={collection?.cover?.data}
                    thumbnails={collection?.featured?.data}
                    profile_image={collection?.logo?.data}
                    dropdownOption={isAdminWallet}
                    slug={collection?.slug}
                  />
                </div>
              ) : collection.isOpenseaCollection ? (
                <div key={collection.id} className="col-lg-6 col-xl-3 col-md-6 col-sm-6 col-12">
                  <Collection
                    title={collection?.name}
                    total_item={collection?.collectibles?.data?.length}
                    path={`collection/${collection?.slug}`}
                    image={collection?.cover?.data}
                    thumbnails={collection?.featured?.data}
                    profile_image={collection?.logo?.data}
                    dropdownOption={isAdminWallet}
                    slug={collection?.slug}
                  />
                </div>
              ) : null
            ) : <p>No collections to show</p>}

            {loading &&
              <div className="row spinner-container">
                <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem" }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            }
            {pagination?.pageCount > 1 && pagination.page < pagination?.pageCount ? (
              <div className="row page-load-more mb-5">
                <Button onClick={() => getCollectionPaginationRecord(pagination.page + 1)}>
                  ...Load More
                </Button>
              </div>
            ) : null}
          </div>
        ) : <p>No collections to show</p>}
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

import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import SectionTitle from "@components/section-title/layout-02";
import ProductFilter from "@components/product-filter/layout-03";
import Product from "@components/product/layout-01";
import Pagination from "@components/pagination-02";
import { SectionTitleType, ProductType } from "@utils/types";
import { flatDeep } from "@utils/methods";
import { useLazyQuery } from "@apollo/client";
import { ALL_COLLECTIBLE_LISTDATA_QUERY } from "src/graphql/query/collectibles/getCollectible";
import { useRouter } from "next/router";
import { ALL_AUCTION_LISTDATA_QUERY } from "src/graphql/query/auctions/getAuctions";

const ExploreProductArea = ({
  className,
  space,
  data: { section_title, products, placeBid, collectionPage, paginationdata, collectionData }
}) => {
  const [getCollectible, { data: collectiblesFilters, error }] = useLazyQuery(ALL_AUCTION_LISTDATA_QUERY, {
    fetchPolicy: "cache-and-network"
  });

  const [collectionsData, setCollectionsData] = useState();
  const router = useRouter();
  const routerQuery = router?.query?.collection?.split();
  const [onChangeValue, setOnChangeValue] = useState("newest");
  const [onchangepriceRange, setonchangepriceRange] = useState({ price: [0, 100] });
  const [checkedCollection, setCheckedCollection] = useState([]);

  let categoriesold = [];
  const cats = flatDeep(
    products.map((prod) => prod.attributes.collectible.data?.attributes.collection.data?.attributes.name)
  );
  categoriesold = cats.reduce((obj, b) => {
    const newObj = { ...obj };
    newObj[b] = obj[b] + 1 || 1;
    return newObj;
  }, {});

  const [onchangecheckData, setonchangecheckData] = useState(categoriesold);
  const [pagination, setPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 0,
    total: 0
  });
  if (router.query.collection) {
    collectionPage = true;
  }
  useEffect(() => {
    if (collectionData.data) {
      console.log("collectionData.data", collectionData);
      setPagination(collectionData.meta.pagination);
      setCollectionsData(collectionData.data);
    }
  }, [collectionData.data]);

  // useEffect(() => {
  //   if (router?.query?.collection) {
  //     getCollectible({
  //       variables: {
  //         filters: {
  //           collection: {
  //             name: {
  //               in: routerQuery
  //             },
  //             id: {
  //               notNull: true
  //             }
  //           }
  //         },
  //         pagination: { pageSize: 6 }
  //       }
  //     });
  //   }
  //   if (checkedCollection.length) {
  //     getCollectible({
  //       variables: {
  //         filters: {
  //           collection: {
  //             name: {
  //               in: checkedCollection
  //             },
  //             id: {
  //               notNull: true
  //             }
  //           }
  //         },
  //         pagination: { pageSize: 6 }
  //       }
  //     });
  //   }
  //   //  else {
  //   //   getCollectible({
  //   //     variables: { pagination: { pageSize: 6 } }
  //   //   });
  //   // }
  // }, [router.query.collection]);
  let filters = {
    status: {
      eq: "Live"
    }
  };

  if (router.query.collection) {
    console.log("router.query", router.query);
    filters.collectible = {
      collection: {
        name: {
          in: routerQuery
        }
      }
    };
  }
  if (checkedCollection.length) {
    filters.collectible = {
      collection: {
        name: {
          in: checkedCollection
        }
      }
    };
  }
  console.log("filters", filters);

  useEffect(() => {
    if (collectiblesFilters) {
      console.log("collectiblesFilters", collectiblesFilters.auctions);
      setPagination(collectiblesFilters.auctions.meta.pagination);
      setCollectionsData(collectiblesFilters.auctions.data);
    }
  }, [collectiblesFilters, error]);

  const getCollectionPaginationRecord = (page) => {
    // let filters = {
    //   auction: {
    //     status: {
    //       eq: "Live"
    //     }
    //   }
    // };

    // if (router.query.collection) {
    //   filters.collectible = {
    //     collection: {
    //       name: {
    //         in: checkedCollection
    //       }
    //     }
    //   };
    // }
    // if (checkedCollection.length) {
    //   filters.collectible = {
    //     collection: {
    //       name: {
    //         in: checkedCollection
    //       }
    //     }
    //   };
    // }
    getCollectible({
      variables: {
        filters: filters,
        pagination: { page, pageSize: 6 }
      }
    });
  };

  const getCollectibleSortData = (onchangeSort) => {
    setOnChangeValue(onchangeSort);
    // let filters = {
    //   auction: {
    //     status: {
    //       eq: "Live"
    //     }
    //   }
    // };

    // if (router.query.collection) {
    //   filters.collection = {
    //     name: {
    //       in: routerQuery
    //     },
    //     id: {
    //       notNull: true
    //     }
    //   };
    // }
    // if (checkedCollection.length) {
    //   filters.collection = {
    //     name: {
    //       in: checkedCollection
    //     }
    //   };
    // }
    let pagination = { pageSize: 6 };
    if (onchangeSort == "oldest") {
      getCollectible({
        variables: {
          filters: filters,
          pagination: pagination,
          sort: ["createdAt:asc"]
        }
      });
    }
    if (onchangeSort == "newest") {
      getCollectible({
        variables: {
          filters: filters,
          sort: ["createdAt:desc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "low-to-high") {
      getCollectible({
        variables: {
          filters: filters,
          sort: ["price:asc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "high-to-low") {
      getCollectible({
        variables: {
          filters: filters,
          sort: ["price:desc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "Fixed-price") {
      getCollectible({
        variables: {
          filters: {
            ...filters,
            auction: {
              sellType: {
                eq: "FixedPrice"
              }
            }
          },
          sort: ["createdAt:asc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "Auction") {
      getCollectible({
        variables: {
          filters: {
            ...filters,
            auction: {
              sellType: {
                eq: "Bidding"
              }
            }
          },
          pagination: pagination,
          sort: "auction.startTimestamp:desc"
        }
      });
    }
  };

  const getCollectibleFilterData = (onchangefilter) => {
    // let filters = {
    // price: {
    //   between: onchangefilter
    // },
    //   auction: {
    //     status: {
    //       eq: "Live"
    //     }
    //   }
    // };

    // if (router.query.collection) {
    //   filters.collection = {
    //     name: {
    //       in: routerQuery
    //     }
    //   };
    // }
    // if (checkedCollection.length) {
    //   filters.collection = {
    //     name: {
    //       in: checkedCollection
    //     }
    //   };
    // }
    setonchangepriceRange({ price: onchangefilter });
    if (onchangefilter)
      getCollectible({
        variables: {
          filters: {
            ...filters,
            bidPrice: {
              between: onchangefilter
            }
          },
          pagination: { pageSize: 6 }
        }
      });
  };
  const getCollectiblecheckData = (onchangefilter) => {
    setCheckedCollection(onchangefilter);
    // let filters = {
    //   auction: {
    //     status: {
    //       eq: "Live"
    //     }
    //   }
    // };
    // if (router.query.collection) {
    //   filters.collection = {
    //     name: {
    //       eq: routerQuery
    //     }
    //   };
    // }
    // if (checkedCollection.length) {
    //   filters.collection = {
    //     name: {
    //       in: checkedCollection
    //     }
    //   };
    // }
    if (onchangefilter?.length <= 0)
      getCollectible({
        variables: {
          filters: filters,
          pagination: { pageSize: 6 }
        }
      });
    else {
      getCollectible({
        variables: {
          filters: {
            collection: {
              name: {
                in: onchangefilter
              }
            },
            auction: {
              status: {
                eq: "Live"
              }
            }
          },
          pagination: { pageSize: 6 }
        }
      });
    }
  };

  return (
    <div className={clsx("explore-area", space === 1 && "rn-section-gapTop", className)} id="explore-id">
      <div className="container">
        <div className="row mb--40">
          <div className="col-12">{section_title && <SectionTitle disableAnimation {...section_title} />}</div>
        </div>
        <div className="row g-5">
          <div className="col-lg-3 order-2 order-lg-1">
            <ProductFilter
              sortHandler={getCollectibleSortData}
              inputs={onchangepriceRange}
              inputcheck={onchangecheckData}
              sort={onChangeValue}
              categories={categoriesold}
              checkHandler={getCollectiblecheckData}
              priceHandler={getCollectibleFilterData}
              collectionPage={collectionPage}
              products={products}
              routerQuery={routerQuery}
            />
          </div>
          <div className="col-lg-9 order-1 order-lg-2">
            <div className="row g-5">
              {collectionsData?.length > 0 ? (
                <>
                  {console.log("collectionsData321", collectionsData)}{" "}
                  {collectionsData?.map((prod, index) => (
                    <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                      <Product
                        placeBid={prod.attributes?.sellType == "Bidding"}
                        title={prod.attributes.collectible.data.attributes?.name}
                        slug={prod.attributes.collectible.data.attributes?.slug}
                        supply={prod.attributes.collectible.data.attributes?.supply}
                        price={prod.attributes?.bidPrice}
                        symbol={prod.attributes?.priceCurrency}
                        image={prod.attributes?.collectible.data.attributes?.image?.data?.attributes?.url}
                        collectionName={
                          prod.attributes?.collectible.data.attributes?.collection?.data?.attributes?.name
                        }
                        bitCount={prod.attributes?.sellType == "Bidding" ? prod.attributes?.biddings?.data.length : 0}
                        latestBid={prod.attributes?.collectible.data.attributes?.latestBid}
                        likeCount={prod.attributes?.collectible.data.attributes?.likeCount}
                        authors={prod.attributes?.collectible.data.attributes?.authors}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <p>No item to show</p>
              )}
              {/* {numberOfPages > 1 ? (
                <Pagination
                  className="single-column-blog"
                  currentPage={state.currentPage}
                  numberOfPages={numberOfPages}
                  onClick={paginationHandler}
                />
              ) : null} */}
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
    </div>
  );
};

ExploreProductArea.propTypes = {
  className: PropTypes.string,
  space: PropTypes.oneOf([1, 2]),
  data: PropTypes.shape({
    section_title: SectionTitleType,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        __typename: PropTypes.string,
        attributes: ProductType
      })
    ).isRequired,
    placeBid: PropTypes.bool,
    collectionPage: PropTypes.bool
    // collectionData: PropTypes.arrayOf(ProductType)
  })
};

ExploreProductArea.defaultProps = {
  space: 1
};

export default ExploreProductArea;

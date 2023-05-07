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

const ExploreProductArea = ({
  className,
  space,
  data: { section_title, products, placeBid, collectionPage, paginationdata, collectionData }
}) => {
  console.log("collectionPage", collectionPage);
  // console.log("paginationdata*********paginationdata*****", paginationdata);

  const [getCollectible, { data: collectiblesFilters, error }] = useLazyQuery(ALL_COLLECTIBLE_LISTDATA_QUERY, {
    fetchPolicy: "cache-and-network"
  });

  const [getCollectiblequery, { data: collectiblesFiltersquery }] = useLazyQuery(ALL_COLLECTIBLE_LISTDATA_QUERY, {
    fetchPolicy: "cache-and-network"
  });

  const [collectionsData, setCollectionsData] = useState();
  console.log("collectionsData", collectionsData);
  const router = useRouter();
  const routerQuery = router?.query?.collection?.split();
  console.log("router.query", router);
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
    if (router?.query?.collection) {
      getCollectible({
        variables: {
          filter: {
            collection: {
              name: {
                in: routerQuery
              }
            },
            putOnSale: {
              eq: true
            }
          },
          pagination: { pageSize: 6 }
        }
      });
    } else {
      getCollectible({
        variables: { pagination: { pageSize: 6 } }
      });
    }
  }, [router.query.collection]);

  useEffect(() => {
    if (collectionData.data) {
      if (!router?.query?.collection) {
        setCollectionsData(collectionData.data);
      }
    }
  }, [collectionData.data]);

  useEffect(() => {
    if (collectiblesFilters) {
      console.log("collectiblesFiltersDATA", collectiblesFilters?.collectibles);
      setPagination(collectiblesFilters.collectibles.meta.pagination);
      setCollectionsData(collectiblesFilters.collectibles.data);
    }
    // if (collectiblesFiltersquery) {
    //   console.log("collectiblesFiltersquery", collectiblesFiltersquery?.collectibles);
    //   setPagination(collectiblesFiltersquery.collectibles.meta.pagination);
    //   setCollectionsData(collectiblesFiltersquery.collectibles.data);
    // }
  }, [collectiblesFilters, error]);

  const getCollectionPaginationRecord = (page) => {
    let filter = {
      putOnSale: {
        eq: true
      }
    };

    if (router.query.collection) {
      filter.collection = {
        name: {
          in: routerQuery
        },
        putOnSale: {
          eq: true
        }
      };
    }
    getCollectible({
      variables: {
        filter: filter,
        pagination: { page, pageSize: 6 }
      }
    });
  };

  let filter = {
    putOnSale: {
      eq: true
    }
  };

  if (router.query.collection) {
    filter.collection = {
      name: {
        in: routerQuery
      }
    };
  }

  useEffect(() => {
    getCollectible({
      variables: {
        filter: filter,
        pagination: { pageSize: 6 }
      }
    });
  }, []);

  const [onChangeValue, setOnChangeValue] = useState("newest");

  const getCollectibleSortData = (onchangeSort) => {
    let filter = {
      putOnSale: {
        eq: true
      }
    };

    if (router.query.collection) {
      filter.collection = {
        name: {
          in: routerQuery
        }
      };
    }
    let pagination = { pageSize: 6 };
    console.log("onchangeSort*-*-*-*-*-*-*-*-*-*-*-*-*-*", onchangeSort);
    console.log("filter*-*-*-*-*-*-*-*-*-*-*-*-*-*", filter);
    setOnChangeValue(onchangeSort);
    if (onchangeSort == "oldest") {
      getCollectible({
        variables: {
          filter: filter,
          pagination: pagination,
          sort: ["createdAt:desc"]
        }
      });
    }
    if (onchangeSort == "newest") {
      getCollectible({
        variables: {
          filter: filter,
          sort: ["createdAt:asc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "low-to-high") {
      getCollectible({
        variables: {
          filter: filter,
          sort: ["price:asc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "high-to-low") {
      getCollectible({
        variables: {
          filter: filter,
          sort: ["price:desc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "Fixed-price") {
      getCollectible({
        variables: {
          filter: filter,
          sort: ["createdAt:asc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "Auction") {
      getCollectible({
        variables: {
          filter: {
            filter,
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
  const [onchangepriceRange, setonchangepriceRange] = useState({ price: [0, 100] });

  const getCollectibleFilterData = (onchangefilter) => {
    let filter = {
      price: {
        between: onchangefilter
      },
      putOnSale: {
        eq: true
      }
    };

    if (router.query.collection) {
      filter.collection = {
        name: {
          in: routerQuery
        }
      };
    }
    setonchangepriceRange({ price: onchangefilter });
    if (onchangefilter)
      getCollectible({
        variables: {
          filter: filter,
          pagination: { pageSize: 6 }
        }
      });
  };

  let categoriesold = [];
  const cats = flatDeep(products.map((prod) => prod.attributes.collection.data?.attributes.name));
  categoriesold = cats.reduce((obj, b) => {
    const newObj = { ...obj };
    newObj[b] = obj[b] + 1 || 1;
    return newObj;
  }, {});
  console.log("categoriesold", categoriesold);
  const [onchangecheckData, setonchangecheckData] = useState(categoriesold);

  const getCollectiblecheckData = (onchangefilter) => {
    console.log("=*=*=*=*=*=*=*=*collectioncollection", onchangefilter);
    let filter = {
      putOnSale: {
        eq: true
      }
    };

    if (router.query.collection) {
      filter.collection = {
        name: {
          in: routerQuery
        }
      };
    }

    if (onchangefilter.length <= 0)
      getCollectible({
        variables: {
          filter: filter,
          pagination: { pageSize: 6 }
        }
      });
    else {
      getCollectible({
        variables: {
          filter: {
            collection: {
              name: {
                in: onchangefilter
              }
            },
            filter
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
                  {collectionsData?.map((prod, index) => (
                    <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                      <Product
                        placeBid={prod.attributes?.auction?.data?.attributes?.sellType == "Bidding"}
                        title={prod.attributes.name}
                        slug={prod.attributes.slug}
                        supply={prod.attributes.supply}
                        price={prod.attributes?.auction?.data?.attributes?.bidPrice}
                        symbol={prod.attributes?.auction?.data?.attributes?.priceCurrency}
                        image={prod.attributes?.image?.data?.attributes?.url}
                        collectionName={prod.attributes?.collection?.data?.attributes?.name}
                        bitCount={
                          prod.attributes?.auction?.data?.attributes?.sellType == "Bidding"
                            ? prod.attributes?.auction?.data?.attributes?.biddings?.data.length
                            : 0
                        }
                        latestBid={prod.latestBid}
                        likeCount={prod.likeCount}
                        authors={prod.authors}
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
              {console.log("paginationpagination", pagination)}
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

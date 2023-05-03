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

// function reducer(state, action) {
//   switch (action.type) {
//     case "SET_INPUTS":
//       return { ...state, inputs: { ...state.inputs, ...action.payload } };
//     case "SET_SORT":
//       return { ...state, sort: action.payload };
//     case "SET_ALL_PRODUCTS":
//       return { ...state, allProducts: action.payload };
//     case "SET_PRODUCTS":
//       return { ...state, products: action.payload };
//     case "SET_PAGE":
//       return { ...state, currentPage: action.payload };
//     default:
//       return state;
//   }
// }

// const POSTS_PER_PAGE = 12;

const ExploreProductArea = ({
  className,
  space,
  data: { section_title, products, placeBid, collectionPage, paginationdata, collectionData }
}) => {
  debugger;
  console.log("paginationdata", paginationdata);
  const [getCollectible, { data: collectiblesFilters, error }] = useLazyQuery(ALL_COLLECTIBLE_LISTDATA_QUERY, {
    fetchPolicy: "cache-and-network"
  });
  const [collectionsData, setCollectionsData] = useState();
  const [pagination, setPagination] = useState(paginationdata);

  // useEffect(() => {
  //   if (collectiblesFilters?.collections) {
  //     setPagination(collectiblesFilters.collectibles.meta.pagination);
  //     setCollectionsData(collectiblesFilters);
  //   }
  // }, [collectiblesFilters, error]);

  useEffect(() => {
    if (collectiblesFilters?.collectibles) {
      console.log("collectiblesFilters?.collectibles", collectiblesFilters?.collectibles);
      setPagination(collectiblesFilters.collectibles.meta.pagination);
      setCollectionsData(collectiblesFilters?.collectibles);
    }
  }, [collectiblesFilters, error]);

  // useEffect(() => {
  //   getCollectible({
  //     variables: { pagination: { pageSize: 3 } }
  //   });
  // }, []);

  const getCollectionPaginationRecord = (page) => {
    console.log("pagepagepagepage", page);
    getCollectible({
      variables: { pagination: { page, pageSize: 6 } }
    });
  };

  useEffect(() => {
    getCollectible({
      variables: {
        filter: {
          putOnSale: {
            eq: true
          }
        },
        pagination: { pageSize: 6 }
      }
    });
  }, []);

  const [onChangeValue, setOnChangeValue] = useState("newest");

  const getCollectibleSortData = (onchangeSort) => {
    console.log("onchangeSort*-*-*-*-*-*-*-*-*-*-*-*-*-*", onchangeSort);
    setOnChangeValue(onchangeSort);
    if (onchangeSort == "oldest") {
      getCollectible({
        variables: {
          filter: {
            putOnSale: {
              eq: true
            }
          },
          pagination: { pageSize: 6 },
          sort: ["createdAt:desc"]
        }
      });
    }
    if (onchangeSort == "newest") {
      getCollectible({
        variables: {
          filter: {
            putOnSale: {
              eq: true
            }
          },
          sort: ["createdAt:asc"],
          pagination: { pageSize: 6 }
        }
      });
    }
    if (onchangeSort == "low-to-high") {
      getCollectible({
        variables: {
          filter: {
            putOnSale: {
              eq: true
            }
          },
          sort: ["price:asc"],
          pagination: { pageSize: 6 }
        }
      });
    }
    if (onchangeSort == "high-to-low") {
      getCollectible({
        variables: {
          filter: {
            putOnSale: {
              eq: true
            }
          },
          sort: ["price:desc"],
          pagination: { pageSize: 6 }
        }
      });
    }
    if (onchangeSort == "Fixed-price") {
      getCollectible({
        variables: {
          filter: {
            putOnSale: {
              eq: true
            }
          },
          sort: ["createdAt:asc"],
          pagination: { pageSize: 6 }
        }
      });
    }
    if (onchangeSort == "Auction") {
      getCollectible({
        variables: {
          filter: {
            putOnSale: {
              eq: true
            },
            auction: {
              sellType: {
                eq: "Bidding"
              }
            }
          },
          sort: "auction.startTimestamp:desc"
        }
      });
    }
  };
  const [onchangepriceRange, setonchangepriceRange] = useState({ price: [0, 100] });

  const getCollectibleFilterData = (onchangefilter) => {
    setonchangepriceRange({ price: onchangefilter });
    if (onchangefilter)
      getCollectible({
        variables: {
          filter: {
            price: {
              between: onchangefilter
            },
            putOnSale: {
              eq: true
            }
          },
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

  const [onchangecheckData, setonchangecheckData] = useState(categoriesold);

  const getCollectiblecheckData = (onchangefilter) => {
    if (onchangefilter.length <= 0)
      getCollectible({
        variables: {
          filter: {
            putOnSale: {
              eq: true
            }
          },
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
            putOnSale: {
              eq: true
            }
          },
          pagination: { pageSize: 6 }
        }
      });
    }
  };

  // const itemsToFilter = [...products];
  // const [state, dispatch] = useReducer(reducer, {
  //   products: [],
  //   allProducts: products || [],
  //   inputs: { price: [0, 100] },
  //   sort: "newest",
  //   currentPage: 1
  // });

  // const numberOfPages = Math.ceil(state.allProducts.length / POSTS_PER_PAGE);
  // const paginationHandler = (page) => {
  //   dispatch({ type: "SET_PAGE", payload: page });
  //   const start = (page - 1) * POSTS_PER_PAGE;
  //   dispatch({
  //     type: "SET_PRODUCTS",
  //     payload: state.allProducts.slice(start, start + POSTS_PER_PAGE)
  //   });
  //   document.getElementById("explore-id").scrollIntoView({ behavior: "smooth" });
  // };

  // const itemFilterHandler = useCallback(() => {
  //   let filteredItems = [];
  //   filteredItems = itemsToFilter;

  //   dispatch({ type: "SET_ALL_PRODUCTS", payload: filteredItems });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [state.inputs]);

  // useEffect(() => {
  //   itemFilterHandler();
  // }, [itemFilterHandler]);

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
            />
          </div>
          <div className="col-lg-9 order-1 order-lg-2">
            <div className="row g-5">
              {collectionsData?.data?.length > 0 ? (
                <>
                  {collectionsData?.data?.map((prod, index) => (
                    <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                      <Product
                        placeBid={prod.attributes?.auction?.data?.attributes?.sellType == "Bidding"}
                        title={prod.attributes.name}
                        slug={prod.attributes.slug}
                        price={prod.attributes?.auction?.data?.attributes?.bidPrice}
                        symbol={prod.attributes?.auction?.data?.attributes?.priceCurrency}
                        image={prod.attributes?.image?.data?.attributes?.url}
                        collectionName={prod.attributes?.collection?.data?.attributes?.name}
                        latestBid={prod.latestBid}
                        likeCount={prod.likeCount}
                        authors={prod.authors}
                        bitCount={prod.bitCount}
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

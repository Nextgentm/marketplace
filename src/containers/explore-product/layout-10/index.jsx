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

function reducer(state, action) {
  switch (action.type) {
    case "SET_INPUTS":
      return { ...state, inputs: { ...state.inputs, ...action.payload } };
    case "SET_SORT":
      return { ...state, sort: action.payload };
    case "SET_ALL_PRODUCTS":
      return { ...state, allProducts: action.payload };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    default:
      return state;
  }
}

const POSTS_PER_PAGE = 12;

const ExploreProductArea = ({
  className,
  space,
  data: { section_title, products, placeBid, collectionPage, collectionData }
}) => {
  const [getCollectible, { data: collectiblesFilters, error }] = useLazyQuery(ALL_COLLECTIBLE_LISTDATA_QUERY, {
    fetchPolicy: "cache-and-network"
  });
  const [collectionsData, setCollectionsData] = useState();
  useEffect(() => {
    console.log("error", error);
    console.log("collectiblesFilters", collectiblesFilters?.collectibles);
    if (collectiblesFilters?.collectibles) {
      setCollectionsData(collectiblesFilters?.collectibles);
    }
  }, [collectiblesFilters, error]);

  useEffect(() => {
    getCollectible({
      variables: {
        filter: {
          putOnSale: {
            eq: true
          }
        }
      }
    });
  }, []);

  const [onChangeValue, setOnChangeValue] = useState("newest");

  const getCollectibleSortData = (onchangeSort) => {
    setOnChangeValue(onchangeSort);
    if (onchangeSort == "oldest") {
      getCollectible({
        variables: {
          filter: {
            putOnSale: {
              eq: true
            }
          },
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
          sort: ["createdAt:asc"]
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
          sort: ["price:asc"]
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
          sort: ["price:desc"]
        }
      });
    }
  };
  const [onchangepriceRange, setonchangepriceRange] = useState({ price: [] });

  const getCollectibleFilterData = (onchangefilter) => {
    console.log("onchangefilter", onchangefilter);
    setonchangepriceRange(onchangefilter);
    if (onchangefilter)
      getCollectible({
        variables: {
          filter: {
            price: {
              between: onchangefilter
            }
          },
          sort: ["createdAt:desc"]
        }
      });
  };

  // console.log(collectionData);
  const itemsToFilter = [...products];
  const [state, dispatch] = useReducer(reducer, {
    products: [],
    allProducts: products || [],
    inputs: { price: [0, 100] },
    sort: "newest",
    currentPage: 1
  });

  /* Pagination logic start */
  const numberOfPages = Math.ceil(state.allProducts.length / POSTS_PER_PAGE);
  const paginationHandler = (page) => {
    dispatch({ type: "SET_PAGE", payload: page });
    const start = (page - 1) * POSTS_PER_PAGE;
    dispatch({
      type: "SET_PRODUCTS",
      payload: state.allProducts.slice(start, start + POSTS_PER_PAGE)
    });
    document.getElementById("explore-id").scrollIntoView({ behavior: "smooth" });
  };
  // const sortHandler = (value) => {
  //   dispatch({
  //     type: "SET_SORT",
  //     payload: value
  //   });
  //   console.log("collectionsDsxdfgdfgata.data", collectionsData?.data);
  //   const sortedProducts = collectionsData?.data?.sort((a, b) => {
  //     switch (value) {
  //       case "most-liked":
  //         return a.likeCount < b.likeCount ? 1 : -1;
  //       case "least-liked":
  //         return a.likeCount > b.likeCount ? 1 : -1;
  //       case "oldest":
  //         return new Date(a.published_at).getTime() > new Date(b.published_at).getTime() ? 1 : -1;
  //       case "newest":
  //         return new Date(a.published_at).getTime() < new Date(b.published_at).getTime() ? 1 : -1;
  //       case "low-to-high":
  //         return a.price < b.price ? 1 : -1;
  //       case "high-to-low":
  //         return a.price > b.price ? -1 : 1;
  //       default:
  //         return new Date(b.published_at).getTime() > new Date(a.published_at).getTime() ? 1 : -1;
  //     }
  //   });
  //   dispatch({ type: "SET_PRODUCTS", payload: sortedProducts });
  // };

  // useEffect(() => {
  //   sortHandler(state.sort);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [state.currentPage]);
  // const priceHandler = (value) => {
  //   dispatch({ type: "SET_INPUTS", payload: { price: value } });
  // };

  // Filter Handler, this function receives the filter name and the value
  // const filterHandler = useCallback((name, val) => {
  //   dispatch({
  //     type: "SET_INPUTS",
  //     payload: { [name]: val }
  //   });
  // }, []);

  // Filter Method, this function is responsible for filtering the products
  // const filterMethods = (item, filterKey, value) => {
  //   if (value === "all") return false;
  //   const itemKey = filterKey;
  //   if (filterKey === "price") {
  //     return item[itemKey].amount <= value[0] / 100 || item[itemKey].amount >= value[1] / 100;
  //   }

  //   if (Array.isArray(value) && value.length === 0) return false;
  //   if (Array.isArray(item[itemKey])) {
  //     return !item[itemKey].some((a1) => value.includes(a1));
  //   }
  //   if (typeof item[itemKey] === "string" || typeof item[itemKey] === "number") {
  //     return !value.includes(item[itemKey]);
  //   }
  //   return item[itemKey] !== value;
  // };

  // Filter Method, this function is responsible for filtering the products
  const itemFilterHandler = useCallback(() => {
    let filteredItems = [];
    filteredItems = itemsToFilter;

    dispatch({ type: "SET_ALL_PRODUCTS", payload: filteredItems });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.inputs]);

  useEffect(() => {
    itemFilterHandler();
  }, [itemFilterHandler]);

  const initialRender = useRef(0);
  useEffect(() => {
    if (initialRender.current < 2) {
      initialRender.current += 1;
    } else {
      document.getElementById("explore-id").scrollIntoView({ behavior: "smooth" });
    }
  }, [state.inputs]);

  // useEffect(() => {
  //   dispatch({
  //     type: "SET_PRODUCTS",
  //     payload: state.allProducts.slice(0, 0 + POSTS_PER_PAGE)
  //   });
  // }, [state.allProducts]);

  // Generate data from products data
  let categories = [];
  if (!collectionPage) {
    const cats = flatDeep(products.map((prod) => prod.attributes.collection.data?.attributes.name));
    categories = cats.reduce((obj, b) => {
      const newObj = { ...obj };
      newObj[b] = obj[b] + 1 || 1;
      return newObj;
    }, {});
  }

  // const levels = [...new Set(products.map((prod) => prod.level))];
  // const languages = [...new Set(products.map((prod) => prod.language))];

  return (
    <div className={clsx("explore-area", space === 1 && "rn-section-gapTop", className)} id="explore-id">
      <div className="container">
        <div className="row mb--40">
          <div className="col-12">{section_title && <SectionTitle disableAnimation {...section_title} />}</div>
        </div>
        <div className="row g-5">
          <div className="col-lg-3 order-2 order-lg-1">
            {console.log("onchangepriceRange", onchangepriceRange)}
            {console.log("state.inputs", state.inputs)}
            <ProductFilter
              sortHandler={getCollectibleSortData}
              inputs={state.inputs}
              sort={onChangeValue}
              categories={categories}
              // filterHandler={getCollectibleFilterData}
              priceHandler={getCollectibleFilterData}
              collectionPage={collectionPage}
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
              {numberOfPages > 1 ? (
                <Pagination
                  className="single-column-blog"
                  currentPage={state.currentPage}
                  numberOfPages={numberOfPages}
                  onClick={paginationHandler}
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

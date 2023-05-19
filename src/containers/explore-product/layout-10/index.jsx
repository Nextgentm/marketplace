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
import { getCollection } from "src/services/collections/collection";
import { networksList } from "@utils/wallet";
import strapi from "@utils/strapi";

const ExploreProductArea = ({
  className,
  space,
  data: { section_title, products, placeBid, collectionPage, paginationdata, collectionData }
}) => {
  const [getCollectible, { data: collectiblesFilters, error }] = useLazyQuery(ALL_COLLECTIBLE_LISTDATA_QUERY, {
    fetchPolicy: "cache-and-network"
  });
  const [collectionsData, setCollectionsData] = useState();
  const router = useRouter();
  const routerQuery = router?.query?.collection?.split();
  const [onChangeValue, setOnChangeValue] = useState();
  const [onchangepriceRange, setonchangepriceRange] = useState({ price: [0, 100] });
  const [checkedCollection, setCheckedCollection] = useState([]);
  const [dataAll, setDataAll] = useState([]);
  const [selectedFilterNetworks, setSelectedFilterNetworks] = useState([]);
  let categoriesolds = [];

  const cats = flatDeep(products.map((prod) => prod?.collectible?.data?.collection?.data?.name));
  categoriesolds = cats.reduce((obj, b) => {
    const newObj = { ...obj };
    newObj[b] = obj[b] + 1 || 1;
    return newObj;
  }, {});

  const [onchangecheckData, setonchangecheckData] = useState(categoriesolds);
  let categoriesold = [];
  useEffect(() => {
    async function fetchData() {
      const newestItemsFilter = {
        filters: {
          status: {
            $eq: "Live"
          },
          collectible: {
            collection: {
              networkType: {
                in: selectedFilterNetworks
              }
            }
          }
        },
        populate: {
          collectible: {
            populate: ["image", "collection"]
          },
          biddings: {
            fields: ["id"]
          }
        }
      }
      let getdataAll = await strapi.find("auctions", newestItemsFilter);
      const cats = flatDeep(getdataAll.data.map((prod) => prod?.collectible?.data?.collection?.data?.name));
      categoriesold = cats.reduce((obj, b) => {
        const newObj = { ...obj };
        newObj[b] = obj[b] + 1 || 1;
        return newObj;
      }, {});
      setonchangecheckData(categoriesold)
    }
    fetchData();
  }, []);

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
      setCollectionsData(collectionData.data);
      setPagination(collectionData.meta.pagination);
    }
  }, [collectionData.data]);

  useEffect(() => {
    if (router.query.collection) {
      if (checkedCollection.length) {
        getCollectible({
          variables: {
            filter: {
              auction: {
                status: {
                  eq: "Live"
                }
              },
              collection: {
                name: {
                  in: checkedCollection
                },
                id: {
                  notNull: true
                }
              }
            },
            sort: ["createdAt:desc"],
            pagination: { pageSize: 6 }
          }
        });
      } else {
        getCollectible({
          variables: {
            filter: {
              auction: {
                status: {
                  eq: "Live"
                }
              },
              collection: {
                name: {
                  in: routerQuery
                }
              }
            },
            sort: ["createdAt:desc"],
            pagination: { pageSize: 6 }
          }
        });
      }
    }
  }, [router.query.collection]);

  useEffect(() => {
    if (collectiblesFilters) {
      setPagination(collectiblesFilters.collectibles.meta.pagination);
      setCollectionsData(collectiblesFilters.collectibles.data);
    }
  }, [collectiblesFilters, error]);

  const getCollectionPaginationRecord = (page) => {
    let filters = {
      auction: {
        status: {
          eq: "Live"
        }
      },
    };

    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          in: selectedFilterNetworks
        }
      };
    }
    if (router.query.collection) {
      filters.collection = {
        name: {
          in: routerQuery
        }
      };
    }
    if (checkedCollection.length) {
      filters.collection = {
        name: {
          in: checkedCollection
        }
      };
    }
    getCollectible({
      variables: {
        filter: filters,
        pagination: { page, pageSize: 6 }
      }
    });
  };

  const getCollectibleSortData = (onchangeSort) => {
    setOnChangeValue(onchangeSort);
    let filters = {
      auction: {
        status: {
          eq: "Live"
        }
      },
    };

    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          in: selectedFilterNetworks
        }
      };
    }
    if (router.query.collection) {
      filters.collection = {
        name: {
          in: routerQuery
        }
      };
    }
    if (checkedCollection.length) {
      filters.collection = {
        name: {
          in: checkedCollection
        }
      };
    }
    let pagination = { pageSize: 6 };
    if (onchangeSort == "oldest") {
      getCollectible({
        variables: {
          filter: filters,
          pagination: pagination,
          sort: ["createdAt:asc"]
        }
      });
    }
    if (onchangeSort == "newest") {
      getCollectible({
        variables: {
          filter: filters,
          sort: ["createdAt:desc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "low-to-high") {
      getCollectible({
        variables: {
          filter: filters,
          sort: ["price:asc"],
          pagination: pagination
        }
      });
    }
    if (onchangeSort == "high-to-low") {
      getCollectible({
        variables: {
          filter: filters,
          sort: ["price:desc"],
          pagination: pagination
        }
      });
    }

  };
  const getauctionFilterData = (onchangefilter) => {
    setOnChangeValue(onchangefilter);

    let filters = {
    };
    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          in: selectedFilterNetworks
        }
      };
    }

    if (router.query.collection) {
      filters.collection = {
        name: {
          in: routerQuery
        }
      };
    }
    if (checkedCollection.length) {
      filters.collection = {
        name: {
          in: checkedCollection
        }
      };
    }
    let pagination = { pageSize: 6 };
    if (onchangefilter == "Fixed-price") {
      getCollectible({
        variables: {
          filter: {
            ...filters,
            auction: {
              status: {
                eq: "Live"
              }
            }
          },
          sort: ["createdAt:asc"],
          pagination: pagination
        }
      });
    }
    if (onchangefilter == "Auction") {
      getCollectible({
        variables: {
          filter: {
            ...filters,
            auction: {
              status: {
                eq: "Live"
              },
              sellType: {
                in: "Bidding"
              }
            }
          },
          pagination: pagination,
          sort: "auction.startTimestamp:desc"
        }
      });
    }

  }
  const getCollectibleFilterData = (onchangefilter) => {
    let filters = {
      auction: {
        status: {
          eq: "Live"
        }
      },
      price: {
        between: onchangefilter
      },
    };

    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          in: selectedFilterNetworks
        }
      };
    }
    if (router.query.collection) {
      filters.collection = {
        name: {
          in: routerQuery
        }
      };
    }
    if (checkedCollection.length) {
      filters.collection = {
        name: {
          in: checkedCollection
        }
      };
    }
    setonchangepriceRange({ price: onchangefilter });
    if (onchangefilter)
      getCollectible({
        variables: {
          filter: filters,
          pagination: { pageSize: 6 }
        }
      });
  };
  const getCollectiblecheckData = (onchangefilter) => {
    setCheckedCollection(onchangefilter)

    let filters = {
      auction: {
        status: {
          eq: "Live"
        }
      },
    };
    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          in: selectedFilterNetworks
        }
      };
    }
    if (router.query.collection) {
      filters.collection = {
        name: {
          eq: routerQuery
        }
      };
    }
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
          filter: filters,
          pagination: { pageSize: 6 }
        }
      });
    else if (onchangefilter) {
      getCollectible({
        variables: {
          filter: {
            ...filters,
            collection: {
              name: {
                in: onchangefilter
              }
            }
          },
          pagination: { pageSize: 6 }
        }
      });
    }
  };

  const getSelectedFilterNetworksCheckData = (onchangefilter) => {
    setSelectedFilterNetworks(onchangefilter);

    let filters = {
      auction: {
        status: {
          eq: "Live"
        }
      },
    };
    if (router.query.collection) {
      filters.collection = {
        name: {
          eq: routerQuery
        }
      };
    }

    if (onchangefilter?.length <= 0)
      getCollectible({
        variables: {
          filter: filters,
          pagination: { pageSize: 6 }
        }
      });
    else if (onchangefilter) {
      getCollectible({
        variables: {
          filter: {
            ...filters,
            collection: {
              networkType: {
                in: onchangefilter
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
              auctionfilter={getauctionFilterData}
              collectionPage={collectionPage}
              products={products}
              routerQuery={routerQuery}
              networksList={networksList}
              networksCheckHandler={getSelectedFilterNetworksCheckData}
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

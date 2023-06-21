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
import { getCollectible, getCollection } from "src/services/collections/collection";
import { networksList } from "@utils/wallet";
import strapi from "@utils/strapi";

const ExploreProductArea = ({
  className,
  space,
  data: { section_title, categoriesolds, placeBid, collectionPage, paginationdata, collectionData }
}) => {

  const [collectionsData, setCollectionsData] = useState();
  const router = useRouter();
  const routerQuery = router?.query?.collection?.split();
  const [onChangeValue, setOnChangeValue] = useState();
  const [onchangepriceRange, setonchangepriceRange] = useState({ price: [0, 100] });
  const [checkedCollection, setCheckedCollection] = useState([]);
  const [dataAll, setDataAll] = useState([]);
  const [selectedFilterNetworks, setSelectedFilterNetworks] = useState([]);

  const [onchangecheckData, setonchangecheckData] = useState(categoriesolds);
  const setCollectionData = (data, page = 1) => {
    setCollectionsData(data.data);
    setPagination({ ...data.meta.pagination, pageCount: Math.ceil(data.meta.pagination.total / 6), page });
  };
  let categoriesold = {};
  // set categories with count
  // useEffect(() => {
  //   async function fetchData() {
  //     const getAllCollections = await getCollection({
  //       fields: ["name", "id"],
  //       filters: {
  //         collectibles: {
  //           auction: {
  //             status: "Live"
  //           }
  //         }
  //       },
  //       pagination: {
  //         limit: 25,
  //       }
  //     });
  //     // console.log(getAllCollections);
  //     const allCollections = getAllCollections.data;
  //     for (let i = 0; i < allCollections.length; i++) {
  //       const collection = allCollections[i];
  //       const getdataAll = await getCollectible({
  //         filters: {
  //           auction: {
  //             status: "Live"
  //           },
  //           collection: collection.id
  //         },
  //         populate: {
  //           fields: ["name", "id"],
  //         },
  //         pagination: {
  //           limit: 1,
  //         }
  //       });
  //       // console.log(collection.name, getdataAll);
  //       categoriesold[collection.name] = getdataAll.meta.pagination.total;
  //     }
  //     console.log(categoriesold);
  //     setonchangecheckData(categoriesold);
  //   }
  //   fetchData();
  // }, []);

  const [pagination, setPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 0,
    total: 0
  });
  if (router.query.collection) {
    collectionPage = true;
    section_title.title = router.query.collection + " Collection";
  }
  useEffect(() => {
    if (collectionData.data) {
      setCollectionsData(collectionData.data);
      setPagination(collectionData.meta.pagination);
    }
  }, [collectionData.data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (router.query.collection) {
          if (checkedCollection.length) {
            const data = await getCollectible({
              filters: {
                auction: {
                  status: "Live"
                }
              },
              populate: {
                collection: {
                  fields: "*",
                  filter: {
                    name: {
                      $in: checkedCollection
                    },
                    id: {
                      $notNull: true
                    }
                  },
                  populate: {
                    cover: {
                      fields: "*"
                    },
                    logo: {
                      fields: "*"
                    }
                  }
                },
                auction: {
                  fields: "*",
                  filters: {
                    status: "Live",
                    id: { $notNull: true }
                  }
                },
                image: {
                  fields: "*"
                }
              },
              pagination: {
                limit: 6,
                start: 0,
                withCount: true,
                sort: ["createdAt:desc"]
              }
            });
            setCollectionData(data, page);
          } else {
            const data = await getCollectible({
              filter: {
                $or: [{
                  auction: {
                    status: "Live"
                  }
                }, {
                  isOpenseaCollectible: true
                }]
              },
              populate: {
                collection: {
                  fields: "*",
                  filter: {
                    name: routerQuery
                  },
                  populate: {
                    cover: {
                      fields: "*"
                    },
                    logo: {
                      fields: "*"
                    }
                  }
                },
                auction: {
                  fields: "*",
                  filter: {
                    status: "Live",
                    id: { $exists: true }
                  }
                },
                image: {
                  fields: "*"
                }
              },
              pagination: {
                limit: 6,
                start: 0,
                withCount: true,
                sort: ["createdAt:desc"]
              }
            });
            setCollectionData(data, page);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle the error appropriately (e.g., show an error message)
      }
    };

    fetchData();
  }, [router.query.collection]);

  useEffect(() => {
    if (router.query.sort) {
      setOnChangeValue(router.query.sort);
      getCollectibleSortData(router.query.sort);
    }
  }, [router.query.sort]);

  const getCollectionPaginationRecord = async (page) => {
    const start = page * 6 - 6;
    const limit = 6;
    // console.log("getCollectionPaginationRecord");

    let filters = {
      auction: {
        status: {
          $eq: "Live"
        }
      }
    };

    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          $in: selectedFilterNetworks
        }
      };
    }
    if (router.query.collection) {
      filters.collection = {
        name: {
          $in: routerQuery
        }
      };
    }
    if (checkedCollection.length) {
      filters.collection = {
        name: {
          $in: checkedCollection
        }
      };
    }

    let sort = ["priority:asc"];
    if (onChangeValue == "oldest") {
      sort = ["createdAt:asc"];
    }
    if (onChangeValue == "newest") {
      sort = ["createdAt:desc"];
    }
    if (onChangeValue == "low-to-high") {
      sort = ["price:asc"];
    }
    if (onChangeValue == "high-to-low") {
      sort = ["price:desc"];
    }
    if (onChangeValue == "high-to-low") {
      sort = ["price:desc"];
    }
    if (onChangeValue == "Auction") {
      filters.auction = {
        status: {
          $eq: "Live"
        },
        sellType: {
          $eq: "Bidding"
        },
        id: { $notNull: true }
      };
    }
    if (onChangeValue == "Fixed-price") {
      let filters = {};
      if (selectedFilterNetworks.length > 0) {
        filters.collection = {
          networkType: {
            $in: selectedFilterNetworks
          }
        };
      }

      if (router.query.collection) {
        filters.collection = {
          name: {
            $in: routerQuery
          }
        };
      }
      if (checkedCollection.length) {
        filters.collection = {
          name: {
            $in: checkedCollection
          }
        };
      }
      if (onChangeValue == "Fixed-price") {
        filters.auction = {
          status: {
            $eq: "Live"
          },
          sellType: {
            $eq: "FixedPrice"
          }
        };

        const data = await getCollectible({
          filters: filters,
          populate: {
            collection: {
              fields: "*",
              populate: {
                cover: {
                  fields: "*"
                },
                logo: {
                  fields: "*"
                }
              }
            },
            auction: {
              fields: "*",
              filters: {
                status: "Live",
                id: { $notNull: true }
              }
            },
            image: {
              fields: "*"
            }
          },
          pagination: { start, limit },
          sort: ["createdAt:asc"]
        });
        setCollectionData(data, page);
      }
    } else {
      if ((onChangeValue == "oldest" || onChangeValue == "newest" || onChangeValue == "other-marketplace" || selectedFilterNetworks.length < 1)
        && (onChangeValue != "lm-marketplace")) {
        if (router.query.sort == "other-marketplace") {
          filters = {
            isOpenseaCollectible: true,
          };
        } else {
          let filterObj = {
            $or: [{
              ...filters
            }, {
              isOpenseaCollectible: true
            }]
          }
          filters = filterObj;
        }
      }
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: {
          start,
          limit
        },
        sort: sort
      });
      setCollectionData(data, page);
    }
  };

  const getCollectibleSortData = async (onchangeSort) => {
    setOnChangeValue(onchangeSort);
    // console.log("getCollectibleSortData");

    let filters = {
      auction: {
        status: "Live"
      }
    };

    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          $in: selectedFilterNetworks
        }
      };
    }
    if (router.query.collection) {
      filters.collection = {
        name: {
          $in: routerQuery
        }
      };
    }
    if (checkedCollection.length) {
      filters.collection = {
        name: {
          $in: checkedCollection
        }
      };
    }
    let filterObj = {
      $or: [{
        ...filters
      }, {
        isOpenseaCollectible: true
      }]
    }
    filters = filterObj;
    if (router.query.sort == "other-marketplace") {
      filters = {
        isOpenseaCollectible: true,
      };
    }
    // console.log(filters);
    let pagination = { pageSize: 6 };
    if (onchangeSort == "oldest") {
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
        sort: ["createdAt:asc"]
      });
      setCollectionData(data);
    }
    if (onchangeSort == "newest") {
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
        sort: ["createdAt:desc"]
      });
      setCollectionData(data);
    }
    if (onchangeSort == "low-to-high") {
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
        sort: ["price:asc"]
      });
      setCollectionData(data);
    }
    if (onchangeSort == "high-to-low") {
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
        sort: ["price:desc"]
      });
      setCollectionData(data);
    }
    if (onchangeSort == "other-marketplace") {
      const data = await getCollectible({
        filters: {
          isOpenseaCollectible: true
        },
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
      });
      setCollectionData(data);
    }
    if (onchangeSort == "lm-marketplace") {
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
      });
      setCollectionData(data);
    }
  };
  const getauctionFilterData = async (onchangefilter) => {
    setOnChangeValue(onchangefilter);
    // console.log("getauctionFilterData");

    let filters = {};
    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          $in: selectedFilterNetworks
        }
      };
    }

    if (router.query.collection) {
      filters.collection = {
        name: {
          $in: routerQuery
        }
      };
    }
    if (checkedCollection.length) {
      filters.collection = {
        name: {
          $in: checkedCollection
        }
      };
    }
    let pagination = { pageSize: 6 };
    if (onchangefilter == "Fixed-price") {
      filters.auction = {
        status: {
          $eq: "Live"
        },
        sellType: {
          $eq: "FixedPrice"
        }
      };
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
        sort: ["priority:asc"]
      });
      setCollectionData(data);
    }
    if (onchangefilter == "Auction") {
      filters.auction = {
        status: {
          $eq: "Live"
        },
        sellType: {
          $eq: "Bidding"
        }
      };
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
        sort: ["createdAt:asc"]
      });
      setCollectionData(data);
    }
  };
  const getCollectibleFilterData = async (onchangefilter) => {

    // console.log("getCollectibleFilterData");
    let filters = {
      auction: {
        status: {
          $eq: "Live"
        }
      },
      price: {
        $between: onchangefilter
      }
    };

    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          $in: selectedFilterNetworks
        }
      };
    }
    if (router.query.collection) {
      filters.collection = {
        name: {
          $in: routerQuery
        }
      };
    }
    if (checkedCollection.length) {
      filters.collection = {
        name: {
          $in: checkedCollection
        }
      };
    }
    setonchangepriceRange({ price: onchangefilter });
    if (onchangefilter) {
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: { pageSize: 6 },
        sort: ["priority:asc"]
      });
      setCollectionData(data);
    }
  };
  const getCollectiblecheckData = async (onchangefilter) => {
    setCheckedCollection(onchangefilter);
    // console.log("getCollectiblecheckData");

    let filters = {
      auction: {
        status: {
          $eq: "Live"
        }
      }
    };
    if (selectedFilterNetworks.length > 0) {
      filters.collection = {
        networkType: {
          $in: selectedFilterNetworks
        }
      };
    }
    if (router.query.collection) {
      filters.collection = {
        name: {
          $eq: routerQuery
        }
      };
    }
    if (onchangefilter?.length <= 0) {
      let filterObj = {
        $or: [{
          ...filters
        }, {
          isOpenseaCollectible: true,
        }]
      }
      filters = filterObj;
      if (router.query.sort == "other-marketplace") {
        filters = {
          isOpenseaCollectible: true,
        };
      } let sortedFilter = ["priority:asc"];
      if (router.query.sort == "newest") {
        sortedFilter = ["createdAt:desc"]
      }
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: { pageSize: 6 },
        sort: sortedFilter
      });
      setCollectionData(data);
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     pagination: { pageSize: 6 }
      //   }
      // });
    } else if (onchangefilter) {
      filters.collection = {
        name: {
          $in: onchangefilter
        }
      };
      let filterObj = {
        $or: [{
          ...filters
        }, {
          isOpenseaCollectible: true,
          collection: {
            name: {
              $in: onchangefilter
            }
          }
        }]
      }
      filters = filterObj;
      // console.log(filters);
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: { pageSize: 6 }
      });
      // console.log(data);
      setCollectionData(data);
    }
  };

  const getSelectedFilterNetworksCheckData = async (onchangefilter) => {
    setSelectedFilterNetworks(onchangefilter);
    // console.log("getSelectedFilterNetworksCheckData");
    let filters = {
      auction: {
        status: {
          $eq: "Live"
        }
      }
    };
    if (router.query.collection) {
      filters.collection = {
        name: {
          $eq: routerQuery
        }
      };
    }

    if (onchangefilter?.length <= 0) {
      if (routerQuery) {
        let filterObj = {
          $or: [{
            ...filters
          }, {
            isOpenseaCollectible: true,
            collection: {
              name: {
                $eq: routerQuery
              }
            }
          }]
        }
        filters = filterObj;
      }
      if (router.query.sort == "other-marketplace") {
        filters = {
          isOpenseaCollectible: true,
        };
      }
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: { pageSize: 6 },
        sort: ["priority:asc"]
      });
      setCollectionData(data);
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     pagination: { pageSize: 6 }
      //   }
      // });
    } else if (onchangefilter) {
      filters.collection = {
        networkType: {
          $in: onchangefilter
        }
      };
      const data = await getCollectible({
        filters: filters,
        populate: {
          collection: {
            fields: "*",
            populate: {
              cover: {
                fields: "*"
              },
              logo: {
                fields: "*"
              }
            }
          },
          auction: {
            fields: "*",
            filters: {
              status: "Live",
              id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: { pageSize: 6 }
      });
      setCollectionData(data);
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
              routerQuery={routerQuery}
              networksList={networksList}
              networksCheckHandler={getSelectedFilterNetworksCheckData}
            />
          </div>
          <div className="col-lg-9 order-1 order-lg-2">
            <div className="row g-5">
              {/* {console.log("collectionsData", collectionsData)} */}
              {collectionsData?.length > 0 ? (
                <>
                  {collectionsData?.map((prod, index) => (
                    <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                      <Product
                        placeBid={prod?.auction?.data?.sellType == "Bidding"}
                        title={prod.name}
                        slug={prod.isOpenseaCollectible ? prod.marketURL : prod.slug}
                        supply={prod.supply}
                        price={prod?.auction?.data[0]?.bidPrice}
                        symbol={prod?.auction?.data[0]?.priceCurrency}
                        image={prod?.image?.data ? prod?.image?.data?.url : prod?.image_url}
                        collectionName={prod?.collection?.data?.name}
                        bitCount={
                          prod?.auction?.data[0]?.sellType == "Bidding" ? prod?.auction?.data?.biddings?.data.length : 0
                        }
                        latestBid={prod.latestBid}
                        likeCount={prod.likeCount}
                        authors={prod.authors}
                        isOpenseaCollectible={prod.isOpenseaCollectible}
                        network={prod.collection?.data?.networkType}
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
    // products: PropTypes.arrayOf(
    //   PropTypes.shape({
    //     __typename: PropTypes.string,
    //     attributes: ProductType
    //   })
    // ).isRequired,
    placeBid: PropTypes.bool,
    collectionPage: PropTypes.bool
    // collectionData: PropTypes.arrayOf(ProductType)
  })
};

ExploreProductArea.defaultProps = {
  space: 1
};

export default ExploreProductArea;

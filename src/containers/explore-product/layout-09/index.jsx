import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import SectionTitle from "@components/section-title/layout-02";
import ProductFilter from "@components/product-filter/layout-03";
import Product from "@components/product/layout-01";
import Pagination from "@components/pagination-02";
import { SectionTitleType, ProductType } from "@utils/types";
import { flatDeep } from "@utils/methods";
import { useRouter } from "next/router";
import { getCollectible, getCollection } from "src/services/collections/collection";
import strapi from "@utils/strapi";
import { Button, Spinner } from "react-bootstrap";

const ExploreProductArea = ({
  className,
  space,
  data: { section_title, collectionPage, products, collection }
}) => {

  const [loading, setLoading] = useState(false);
  const [collectionsData, setCollectionsData] = useState();
  const router = useRouter();
  const [onChangeValue, setOnChangeValue] = useState();
  const [onchangepriceRange, setonchangepriceRange] = useState({ price: [0, 0.5] });

  const [selectedFilterCardType, setSelectedFilterCardType] = useState([]);

  const PAGE_SIZE = 9; //set for index page manually [slug].jsx

  const setCollectionData = (data, page = 1, loadmore) => {
    if (loadmore && collectionsData) {
      setCollectionsData([...collectionsData, ...data.data]);
    } else {
      setCollectionsData(data.data);
    }
    setPagination({ ...data.meta.pagination, pageCount: Math.ceil(data.meta.pagination.total / PAGE_SIZE), page });
  };

  const [pagination, setPagination] = useState({
    page: 1,
    pageCount: 1,
    pageSize: 0,
    total: 0
  });

  const cardTypeList = [
    {
      name: "Platinum"
    },
    {
      name: "Gold"
    },
    {
      name: "Bronze"
    },
  ];

  useEffect(() => {
    if (products) {
      setCollectionsData(products.data);
      setPagination(products.meta.pagination);
    }
  }, [products]);

  const getCollectionPaginationRecord = async (page) => {
    const start = page * PAGE_SIZE - PAGE_SIZE;
    const limit = PAGE_SIZE;
    // console.log("getCollectionPaginationRecord");

    setLoading(true);
    let filters = {
      auction: {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
      },
      collection: {
        id: {
          $eq: collection.id
        }
      }
    };

    if (selectedFilterCardType.length > 0) {
      if (selectedFilterCardType.length == 1) {
        filters = {
          name: {
            $containsi: selectedFilterCardType[0]
          }
        };
      } else if (selectedFilterCardType.length == 2) {
        filters = {
          $or: [
            {
              name: {
                $containsi: selectedFilterCardType[0]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[1]
              }
            }
          ]
        };
      } else if (selectedFilterCardType.length == 3) {
        filters = {
          $or: [
            {
              name: {
                $containsi: selectedFilterCardType[0]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[1]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[2]
              }
            }
          ]
        };
      }
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
      let filters = {
        collection: {
          id: {
            $eq: collection.id
          }
        }
      };
      if (selectedFilterCardType.length > 0) {
        if (selectedFilterCardType.length == 1) {
          filters = {
            name: {
              $containsi: selectedFilterCardType[0]
            }
          };
        } else if (selectedFilterCardType.length == 2) {
          filters = {
            $or: [
              {
                name: {
                  $containsi: selectedFilterCardType[0]
                }
              },
              {
                name: {
                  $containsi: selectedFilterCardType[1]
                }
              }
            ]
          };
        } else if (selectedFilterCardType.length == 3) {
          filters = {
            $or: [
              {
                name: {
                  $containsi: selectedFilterCardType[0]
                }
              },
              {
                name: {
                  $containsi: selectedFilterCardType[1]
                }
              },
              {
                name: {
                  $containsi: selectedFilterCardType[2]
                }
              }
            ]
          };
        }
      }

      if (onChangeValue == "Fixed-price") {
        filters.auction = {
          status: {
            $eq: "Live"
          },
          endTimeStamp: {
            $gt: new Date()
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
                endTimeStamp: {
                  $gt: new Date()
                },
                id: { $notNull: true }
              }
            },
            image: {
              fields: "*"
            }
          },
          pagination: { start, limit },
          sort: ["priority:asc"],
        });
        setLoading(false);
        setCollectionData(data, page, true);
      }
    } else {
      if ((onChangeValue == "oldest" || onChangeValue == "newest" || onChangeValue == "other-marketplace" || selectedFilterCardType.length < 1)
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
              endTimeStamp: {
                $gt: new Date()
              },
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
      setLoading(false);
      setCollectionData(data, page, true);
    }
  };

  const getCollectibleSortData = async (onchangeSort) => {
    setOnChangeValue(onchangeSort);
    // console.log("getCollectibleSortData");
    setLoading(true);

    let filters = {
      auction: {
        status: "Live",
        endTimeStamp: {
          $gt: new Date()
        },
      },
      collection: {
        id: {
          $eq: collection.id
        }
      }
    };

    if (selectedFilterCardType.length > 0) {
      if (selectedFilterCardType.length == 1) {
        filters = {
          name: {
            $containsi: selectedFilterCardType[0]
          }
        };
      } else if (selectedFilterCardType.length == 2) {
        filters = {
          $or: [
            {
              name: {
                $containsi: selectedFilterCardType[0]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[1]
              }
            }
          ]
        };
      } else if (selectedFilterCardType.length == 3) {
        filters = {
          $or: [
            {
              name: {
                $containsi: selectedFilterCardType[0]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[1]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[2]
              }
            }
          ]
        };
      }
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
    let pagination = { pageSize: PAGE_SIZE };
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
              endTimeStamp: {
                $gt: new Date()
              },
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
      setLoading(false);
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
              endTimeStamp: {
                $gt: new Date()
              },
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
      setLoading(false);
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
              endTimeStamp: {
                $gt: new Date()
              },
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
      setLoading(false);
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
              endTimeStamp: {
                $gt: new Date()
              },
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
      setLoading(false);
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
              endTimeStamp: {
                $gt: new Date()
              },
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
      });
      setLoading(false);
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
              endTimeStamp: {
                $gt: new Date()
              },
              id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: pagination,
      });
      setLoading(false);
      setCollectionData(data);
    }
  };

  const getauctionFilterData = async (onchangefilter) => {
    setOnChangeValue(onchangefilter);
    // console.log("getauctionFilterData");
    setLoading(true);

    let filters = {
      collection: {
        id: {
          $eq: collection.id
        }
      }
    };
    if (selectedFilterCardType.length > 0) {
      if (selectedFilterCardType.length == 1) {
        filters = {
          name: {
            $containsi: selectedFilterCardType[0]
          }
        };
      } else if (selectedFilterCardType.length == 2) {
        filters = {
          $or: [
            {
              name: {
                $containsi: selectedFilterCardType[0]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[1]
              }
            }
          ]
        };
      } else if (selectedFilterCardType.length == 3) {
        filters = {
          $or: [
            {
              name: {
                $containsi: selectedFilterCardType[0]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[1]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[2]
              }
            }
          ]
        };
      }
    }

    let pagination = { pageSize: PAGE_SIZE };
    if (onchangefilter == "Fixed-price") {
      filters.auction = {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
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
              endTimeStamp: {
                $gt: new Date()
              },
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
      setLoading(false);
      setCollectionData(data);
    }
    if (onchangefilter == "Auction") {
      filters.auction = {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
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
              endTimeStamp: {
                $gt: new Date()
              },
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
      setLoading(false);
      setCollectionData(data);
    }
    setLoading(false);
  };

  const getCollectibleFilterData = async (onchangefilter) => {

    setLoading(true);
    // console.log("getCollectibleFilterData");
    let filters = {
      auction: {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
      },
      collection: {
        id: {
          $eq: collection.id
        }
      },
      price: {
        $between: onchangefilter
      }
    };

    if (selectedFilterCardType.length > 0) {
      if (selectedFilterCardType.length == 1) {
        filters = {
          name: {
            $containsi: selectedFilterCardType[0]
          }
        };
      } else if (selectedFilterCardType.length == 2) {
        filters = {
          $or: [
            {
              name: {
                $containsi: selectedFilterCardType[0]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[1]
              }
            }
          ]
        };
      } else if (selectedFilterCardType.length == 3) {
        filters = {
          $or: [
            {
              name: {
                $containsi: selectedFilterCardType[0]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[1]
              }
            },
            {
              name: {
                $containsi: selectedFilterCardType[2]
              }
            }
          ]
        };
      }
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
              endTimeStamp: {
                $gt: new Date()
              },
              // id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: { pageSize: PAGE_SIZE },
        sort: ["priority:asc"]
      });
      setLoading(false);
      setCollectionData(data);
    }
    setLoading(false);
  };

  const getSelectedFilterCardTypeCheckData = async (onchangefilter) => {
    setSelectedFilterCardType(onchangefilter);
    // console.log("getSelectedFilterCardTypeCheckData");
    setLoading(true);
    let filters = {
      auction: {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
      },
      collection: {
        id: {
          $eq: collection.id
        }
      }
    };

    if (onchangefilter?.length <= 0) {
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
              endTimeStamp: {
                $gt: new Date()
              },
              id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        pagination: { pageSize: PAGE_SIZE },
        sort: ["priority:asc"]
      });
      setLoading(false);
      setCollectionData(data);
    } else if (onchangefilter) {
      if (onchangefilter.length == 1) {
        filters = {
          name: {
            $containsi: onchangefilter[0]
          }
        };
      } else if (onchangefilter.length == 2) {
        filters = {
          $or: [
            {
              name: {
                $containsi: onchangefilter[0]
              }
            },
            {
              name: {
                $containsi: onchangefilter[1]
              }
            }
          ]
        };
      } else if (onchangefilter.length == 3) {
        filters = {
          $or: [
            {
              name: {
                $containsi: onchangefilter[0]
              }
            },
            {
              name: {
                $containsi: onchangefilter[1]
              }
            },
            {
              name: {
                $containsi: onchangefilter[2]
              }
            }
          ]
        };
      }
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
              endTimeStamp: {
                $gt: new Date()
              },
              id: { $notNull: true }
            }
          },
          image: {
            fields: "*"
          }
        },
        sort: ["priority:asc"],
        pagination: { pageSize: PAGE_SIZE }
      });
      setLoading(false);
      setCollectionData(data);
    }
    setLoading(false);
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
              sort={onChangeValue}
              priceHandler={getCollectibleFilterData}
              auctionfilter={getauctionFilterData}
              collectionPage={collectionPage}
              cardTypeList={collection.id == 7 ? cardTypeList : null}
              cardTypeCheckHandler={getSelectedFilterCardTypeCheckData}
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
                        collectionName={collection?.name}
                        bitCount={
                          prod?.auction?.data[0]?.sellType == "Bidding" ? prod?.auction?.data?.biddings?.data.length : 0
                        }
                        latestBid={prod.latestBid}
                        likeCount={prod.likeCount}
                        authors={prod.authors}
                        isOpenseaCollectible={prod.isOpenseaCollectible}
                        network={collection?.networkType}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <p>No item to show</p>
              )}

              {loading &&
                <div className="row spinner-container">
                  <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem" }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              }
              {pagination?.pageCount > 1 && pagination.page < pagination?.pageCount ? (
                <div className="row page-load-more">
                  <Button onClick={() => getCollectionPaginationRecord(pagination.page + 1)}>
                    ...Load More
                  </Button>
                </div>
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
      ProductType
    ),
    // placeBid: PropTypes.bool,
    collectionPage: PropTypes.bool,
    collection: PropTypes.shape({})
  })
};

ExploreProductArea.defaultProps = {
  space: 1
};

export default ExploreProductArea;

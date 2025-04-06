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
import { Button, Spinner } from "react-bootstrap";

const ExploreProductArea = ({
  className,
  space,
  data: { section_title, categoriesolds, placeBid, collectionPage, paginationdata, collectionData }
}) => {
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [collectionsData, setCollectionsData] = useState(collectionData?.data || []);
  const router = useRouter();
  const routerQuery = router?.query?.collection;
  const [onChangeValue, setOnChangeValue] = useState();
  const [onchangepriceRange, setonchangepriceRange] = useState({ price: [0, 0.5] });
  const [checkedCollection, setCheckedCollection] = useState([]);
  const [dataAll, setDataAll] = useState([]);
  const [selectedFilterNetworks, setSelectedFilterNetworks] = useState([]);
  const [onchangecheckData, setonchangecheckData] = useState(categoriesolds || {});

  const PAGE_SIZE = 9;

  const [pagination, setPagination] = useState({
    page: 1,
    pageCount: Math.ceil((paginationdata?.total || 0) / PAGE_SIZE),
    pageSize: PAGE_SIZE,
    total: paginationdata?.total || 0
  });

  // Initialize with server-side data
  useEffect(() => {
    if (collectionData?.data) {
      setCollectionsData(collectionData.data);
    }
    if (paginationdata) {
      setPagination({
        page: 1,
        pageCount: Math.ceil(paginationdata.total / PAGE_SIZE),
        pageSize: PAGE_SIZE,
        total: paginationdata.total
      });
    }
  }, [collectionData, paginationdata]);

  const setCollectionData = (data, page = 1, loadmoreData) => {
    if (loadmoreData && collectionsData) {
      setCollectionsData([...collectionsData, ...data.data]);
    } else {
      setCollectionsData(data.data);
    }
    setPagination({ ...data.meta.pagination, pageCount: Math.ceil(data.meta.pagination.total / PAGE_SIZE), page });
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

  const fetchData = async () => {
    try {
      if (router.query.collection) {
        if (checkedCollection.length) {
          const data = await getCollectible({
            filters: {
              auction: {
                status: "Live",
                endTimeStamp: {
                  $gt: new Date()
                },
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
            pagination: {
              limit: PAGE_SIZE,
              start: 0,
              withCount: true,
              sort: ["createdAt:desc"]
            }
          });
          setLoading(false);
          setCollectionData(data, page);
        } else {
          const data = await getCollectible({
            filter: {
              $or: [{
                auction: {
                  status: "Live",
                  endTimeStamp: {
                    $gt: new Date()
                  },
                }
              }, {
                isOpenseaCollectible: true
              }]
            },
            populate: {
              collection: {
                fields: "*",
                filter: {
                  slug: routerQuery
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
                  endTimeStamp: {
                    $gt: new Date()
                  },
                  id: { $exists: true }
                }
              },
              image: {
                fields: "*"
              }
            },
            sort: ["priority:asc"],
            pagination: {
              limit: PAGE_SIZE,
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
    setLoading(false);
  };

  useEffect(() => {
    if (router.query.search) {
      // console.log(router.query.search);
      getSearchQueryData(1);
    } else if (router.query.sort) {
      setOnChangeValue(router.query.sort);
      getCollectibleSortData(router.query.sort);
    } else if (router.query.collection) {
      collectionPage = true;
      const words = router.query.collection.split("-");
      section_title.title = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") + " Collection";
      setLoading(true);
      fetchData();
    } else if (collectionData.data) {
      setCollectionsData(collectionData.data);
      setPagination(collectionData.meta.pagination);
      getCollectionPaginationRecord(1);
    }
  }, [router.query]);


  const getSearchQueryData = async (page) => {
    const start = page * PAGE_SIZE - PAGE_SIZE;
    const limit = PAGE_SIZE;
    page != 1 ? setLoadMore(true) : setLoading(true);
    let filters = {
      auction: {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
      },
      name: {
        $containsi: router.query.search
      }
    };
    console.log(filters);
    let sort = ["priority:asc"];
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
    page != 1 ? setLoadMore(false) : setLoading(false);
    setCollectionData(data, page, page != 1);
  };

  const getCollectionPaginationRecord = async (page) => {
    const start = page * PAGE_SIZE - PAGE_SIZE;
    const limit = PAGE_SIZE;
    // console.log("getCollectionPaginationRecord");
    console.log(page);
    page != 1 ? setLoadMore(true) : setLoading(true);
    console.log(page != 1 ? "setLoadMore true" : "setLoading true");
    let filters = {
      auction: {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
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
        slug: {
          $eq: routerQuery
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
        endTimeStamp: {
          $gt: new Date()
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
          slug: {
            $eq: routerQuery
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
        page != 1 ? setLoadMore(false) : setLoading(false);
        console.log(page != 1 ? "setLoadMore false" : "setLoading false");
        setCollectionData(data, page, true);
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
      page != 1 ? setLoadMore(false) : setLoading(false);
      console.log(page != 1 ? "setLoadMore false" : "setLoading false");
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
        slug: {
          $eq: routerQuery
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
        slug: {
          $eq: routerQuery
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
        slug: {
          $eq: routerQuery
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
  const getCollectiblecheckData = async (onchangefilter) => {
    setCheckedCollection(onchangefilter);
    // console.log("getCollectiblecheckData");
    setLoading(true);

    let filters = {
      auction: {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
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
        slug: {
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
        sort: sortedFilter
      });
      setLoading(false);
      setCollectionData(data);
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     pagination: { pageSize: PAGE_SIZE }
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
        sort: ["priority:asc"],
        pagination: { pageSize: PAGE_SIZE }
      });
      // console.log(data);
      setLoading(false);
      setCollectionData(data);
    }
    setLoading(false);
  };

  const getSelectedFilterNetworksCheckData = async (onchangefilter) => {
    setSelectedFilterNetworks(onchangefilter);
    // console.log("getSelectedFilterNetworksCheckData");
    setLoading(true);
    let filters = {
      auction: {
        status: {
          $eq: "Live"
        },
        endTimeStamp: {
          $gt: new Date()
        },
      }
    };
    if (router.query.collection) {
      filters.collection = {
        slug: {
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
              slug: {
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
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     pagination: { pageSize: PAGE_SIZE }
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
            {loading ?
              <div className="row spinner-container">
                <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem" }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
              :
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

                {loadMore &&
                  <div className="row spinner-container">
                    <Spinner animation="border" role="status" style={{ width: "4rem", height: "4rem" }}>
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                }
                {pagination?.pageCount > 1 && pagination.page < pagination?.pageCount ? (
                  <div className="row page-load-more">
                    <Button onClick={() => router.query.search ? getSearchQueryData(pagination.page + 1) : getCollectionPaginationRecord(pagination.page + 1)}>
                      ...Load More
                    </Button>
                  </div>
                ) : null}
              </div>
            }
          </div>
        </div>
      </div>
    </div >
  );
};

ExploreProductArea.propTypes = {
  className: PropTypes.string,
  space: PropTypes.oneOf([1, 2]),
  data: PropTypes.shape({
    section_title: SectionTitleType,
    categoriesolds: PropTypes.object,
    placeBid: PropTypes.bool,
    collectionPage: PropTypes.bool,
    paginationdata: PropTypes.shape({
      total: PropTypes.number
    }),
    collectionData: PropTypes.shape({
      data: PropTypes.array
    })
  })
};

ExploreProductArea.defaultProps = {
  space: 1
};

export default ExploreProductArea;

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
  data: { section_title, products, placeBid, collectionPage, paginationdata, collectionData }
}) => {
  const [getCollectiblesdata, { data: collectiblesFilters, error }] = useLazyQuery(ALL_COLLECTIBLE_LISTDATA_QUERY, {
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

  // const cats = flatDeep(products.map((prod) => prod?.collection?.data?.name));
  // categoriesolds = cats.reduce((obj, b) => {
  //   const newObj = { ...obj };
  //   newObj[b] = obj[b] + 1 || 1;
  //   return newObj;
  // }, {});
  let cats = {};
  products.map((prod) => {
    if (!cats[prod?.collectible?.data?.collection?.data?.name])
      cats[prod?.collectible?.data?.collection?.data?.name] = [prod?.collectible?.data?.name];
    if (!cats[prod?.collectible?.data?.collection?.data?.name].includes(prod?.collectible?.data?.name))
      cats[prod?.collectible?.data?.collection?.data?.name].push(prod?.collectible?.data?.name);
  });
  // console.log(cats, catsData);
  Object.entries(cats).map(([key, value]) => {
    categoriesolds[key] = value.length;
  });

  const [onchangecheckData, setonchangecheckData] = useState(categoriesolds);
  const setCollectionData = (data, page = 1) => {
    setCollectionsData(data.data);
    setPagination({ ...data.meta.pagination, pageCount: Math.ceil(data.meta.pagination.total / 6), page });
  };
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
      };
      // const getdataAll = await getCollectible({
      //   filters: {
      //     auction: {
      //       status: "Live"
      //     },
      //     collection: {
      //       networkType: {
      //         $in: selectedFilterNetworks
      //       }
      //     }
      //   },
      //   populate: {
      //     collection: {
      //       fields: "*",
      //       populate: {
      //         cover: {
      //           fields: "*"
      //         },
      //         logo: {
      //           fields: "*"
      //         }
      //       }
      //     },
      //     auction: {
      //       fields: "*",
      //       filters: {
      //         status: "Live",
      //         id: { $notNull: true }
      //       }
      //     },
      //     image: {
      //       fields: "*"
      //     }
      //   },
      //   pagination: {
      //     limit: 6,
      //     start: 0,
      //     withCount: true
      //   }
      // });
      let getdataAll = await strapi.find("auctions", newestItemsFilter);
      // const cats = flatDeep(getdataAll.data.map((prod) => prod?.collectible?.data?.collection?.data?.name));
      let cats = {};
      getdataAll.data.map((prod) => {
        if (!cats[prod?.collectible?.data?.collection?.data?.name])
          cats[prod?.collectible?.data?.collection?.data?.name] = [prod?.collectible?.data?.name];
        if (!cats[prod?.collectible?.data?.collection?.data?.name].includes(prod?.collectible?.data?.name))
          cats[prod?.collectible?.data?.collection?.data?.name].push(prod?.collectible?.data?.name);
      });
      // console.log(cats, catsData);
      // console.log(cats);
      Object.entries(cats).map(([key, value]) => {
        categoriesold[key] = value.length;
      });
      // console.log(categoriesold);
      // categoriesold = cats.reduce((obj, b) => {
      //   const newObj = { ...obj };
      //   newObj[b] = obj[b] + 1 || 1;
      //   return newObj;
      // }, {});
      setonchangecheckData(categoriesold);
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
                auction: {
                  status: "Live"
                }
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

  // useEffect(() => {
  //   if (collectiblesFilters) {
  //     setPagination(collectiblesFilters.collectibles.meta.pagination);
  //     setCollectionsData(collectiblesFilters.collectibles.data);
  //   }
  // }, [collectiblesFilters, error]);

  const getCollectionPaginationRecord = async (page) => {
    const start = page * 6 - 6;
    const limit = 6;

    // let filters = {
    //   auction: {
    //     status: {
    //       eq: "Live"
    //     }
    //   }
    // };

    // if (selectedFilterNetworks.length > 0) {
    //   filters.collection = {
    //     networkType: {
    //       in: selectedFilterNetworks
    //     }
    //   };
    // }
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
    // getCollectible({
    //   variables: {
    //     filter: filters,
    //     pagination: { page, pageSize: 6 }
    //   }
    // });

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

    let sort = [];
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
    // let filters = {
    //   auction: {
    //     status: {
    //       eq: "Live"
    //     }
    //   }
    // };

    // if (selectedFilterNetworks.length > 0) {
    //   filters.collection = {
    //     networkType: {
    //       in: selectedFilterNetworks
    //     }
    //   };
    // }
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
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     pagination: pagination,
      //     sort: ["createdAt:asc"]
      //   }
      // });
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
              id: { $notNull: true }
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
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     sort: ["createdAt:desc"],
      //     pagination: pagination
      //   }
      // });
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
              id: { $notNull: true }
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
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     sort: ["price:asc"],
      //     pagination: pagination
      //   }
      // });
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
              id: { $notNull: true }
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
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     sort: ["price:desc"],
      //     pagination: pagination
      //   }
      // });
    }
  };
  const getauctionFilterData = async (onchangefilter) => {
    setOnChangeValue(onchangefilter);

    // let filters = {};
    // if (selectedFilterNetworks.length > 0) {
    //   filters.collection = {
    //     networkType: {
    //       in: selectedFilterNetworks
    //     }
    //   };
    // }

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
        sort: ["createdAt:asc"]
      });
      setCollectionData(data);
      // getCollectiblesdata({
      //   variables: {
      //     filter: {
      //       ...filters,
      //       auction: {
      //         status: {
      //           eq: "Live"
      //         }
      //       }
      //     },
      //     sort: ["createdAt:asc"],
      //     pagination: pagination
      //   }
      // });
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
    // let filters = {
    //   auction: {
    //     status: {
    //       eq: "Live"
    //     }
    //   },
    //   price: {
    //     between: onchangefilter
    //   }
    // };

    // if (selectedFilterNetworks.length > 0) {
    //   filters.collection = {
    //     networkType: {
    //       in: selectedFilterNetworks
    //     }
    //   };
    // }
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
      // getCollectiblesdata({
      //   variables: {
      //     filter: filters,
      //     pagination: { pageSize: 6 }
      //   }
      // });
    }
  };
  const getCollectiblecheckData = async (onchangefilter) => {
    setCheckedCollection(onchangefilter);

    // let filters = {
    //   auction: {
    //     status: {
    //       eq: "Live"
    //     }
    //   }
    // };
    // if (selectedFilterNetworks.length > 0) {
    //   filters.collection = {
    //     networkType: {
    //       in: selectedFilterNetworks
    //     }
    //   };
    // }
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
      // getCollectiblesdata({
      //   variables: {
      //     filter: {
      //       ...filters,
      //       collection: {
      //         name: {
      //           in: onchangefilter
      //         }
      //       }
      //     },
      //     pagination: { pageSize: 6 }
      //   }
      // });
    }
  };

  const getSelectedFilterNetworksCheckData = async (onchangefilter) => {
    setSelectedFilterNetworks(onchangefilter);

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
      // getCollectiblesdata({
      //   variables: {
      //     filter: {
      //       ...filters,
      //       collection: {
      //         networkType: {
      //           in: onchangefilter
      //         }
      //       }
      //     },
      //     pagination: { pageSize: 6 }
      //   }
      // });
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
              {console.log("collectionsData", collectionsData)}
              {collectionsData?.length > 0 ? (
                <>
                  {collectionsData?.map((prod, index) => (
                    <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                      <Product
                        placeBid={prod?.auction?.data?.sellType == "Bidding"}
                        title={prod.name}
                        slug={prod.slug}
                        supply={prod.supply}
                        price={prod?.auction?.data[0]?.bidPrice}
                        symbol={prod?.auction?.data[0]?.priceCurrency}
                        image={prod?.image?.data?.url}
                        collectionName={prod?.collection?.data?.name}
                        bitCount={
                          prod?.auction?.data[0]?.sellType == "Bidding" ? prod?.auction?.data?.biddings?.data.length : 0
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

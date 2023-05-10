import { gql } from "@apollo/client";

export const ALL_AUCTION_DATA_QUERY = gql`
  query auctions(
    $filter: AuctionFiltersInput
    $pagination: PaginationArg
    $sort: [String]
  ) {
    auctions(pagination: $pagination, filter: $filter, sort: $sort) {
      data {
        id
        attributes {
          bidPrice
          endTimeStamp
          priceCurrency
          quantity
          sellType
          startTimestamp
          status
          walletAddress
          paymentToken {
            data {
              attributes {
                polygonAddress
                binanceAddress
                blockchain
                ethAddress
                name
              }
              id
            }
          }
          biddings {
            data {
              id
              attributes {
                bidderAddress
                createdAt
                isAccepted
                timeStamp
                bidPrice
              }
            }
          }
          collectible {
            data {
              attributes {
                name
                nftID
                owner
                owner_histories {
                  data {
                    attributes {
                      quantity
                      toWalletAddress
                      transactionHash
                      fromWalletAddress
                      event
                      createdAt
                    }
                  }
                }
                price
                royalty
                saleType
                slug
                supply
                symbol
                creator
                description
                external_url
                image {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                collectibleProperties {
                  data {
                    attributes {
                      name
                      type
                    }
                  }
                }
                collection {
                  data {
                    attributes {
                      name
                      networkType
                      ownerAddress
                      paymentTokens {
                        data {
                          id
                          attributes {
                            name
                            polygonAddress
                            ethAddress
                            blockchain
                            binanceAddress
                          }
                        }
                      }
                      symbol
                      url
                      slug
                      cover {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      description
                      logo {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      featured {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      contractAddress
                      contractAddress1155
                      collectionType
                      category
                    }
                  }
                }
              }
            }
          }
        }
      }
      meta {
        pagination {
          page
          pageCount
          pageSize
          total
        }
      }
    }
  }  
`;

export const ALL_AUCTION_LISTDATA_QUERY = gql`
query auctions(
  $filters: AuctionFiltersInput
  $pagination: PaginationArg
  $sort: [String]
  ) {
    auctions(pagination: $pagination, filters: $filters, sort: $sort) {
      data {
        id
        attributes {
          bidPrice
          endTimeStamp
          priceCurrency
          quantity
          sellType
          startTimestamp
          status
          walletAddress
          createdAt
          biddings {
            data {
              attributes {
                bidderAddress
                createdAt
                isAccepted
                timeStamp
                bidPrice
              }
            }
          }
          collectible {
            data {
              attributes {
                name
                nftID
                owner
                price
                royalty
                saleType
                slug
                supply
                symbol
                creator
                description
                external_url
                image {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                collection {
                  data {
                    attributes {
                      name
                      networkType
                      slug
                      cover {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      logo {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      featured {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      collectionType
                      category
                    }
                  }
                }
              }
            }
          }
        }
      }
      meta {
        pagination {
          page
          pageCount
          pageSize
          total
        }
      }
    }
  }  
`;

export const GET_AUCTION_DATA_BY_ID_QUERY = gql`
query Auction($auctionId: ID) {
    auction(id: $auctionId) {
      data {
        id
        attributes {
          bidPrice
          endTimeStamp
          priceCurrency
          quantity
          sellType
          startTimestamp
          status
          walletAddress
          paymentToken {
            data {
              attributes {
                polygonAddress
                binanceAddress
                blockchain
                ethAddress
                name
              }
              id
            }
          }
          biddings {
            data {
              id
              attributes {
                bidderAddress
                createdAt
                isAccepted
                timeStamp
                bidPrice
              }
            }
          }
          collectible {
            data {
              attributes {
                name
                nftID
                owner
                owner_histories {
                  data {
                    attributes {
                      quantity
                      toWalletAddress
                      transactionHash
                      fromWalletAddress
                      event
                      createdAt
                    }
                  }
                }
                price
                royalty
                saleType
                slug
                supply
                symbol
                creator
                description
                external_url
                image {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                collectibleProperties {
                  data {
                    attributes {
                      name
                      type
                    }
                  }
                }
                collection {
                  data {
                    attributes {
                      name
                      networkType
                      ownerAddress
                      paymentTokens {
                        data {
                          id
                          attributes {
                            name
                            polygonAddress
                            ethAddress
                            blockchain
                            binanceAddress
                          }
                        }
                      }
                      symbol
                      url
                      slug
                      cover {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      description
                      logo {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      featured {
                        data {
                          attributes {
                            url
                            name
                          }
                        }
                      }
                      contractAddress
                      contractAddress1155
                      collectionType
                      category
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
}  
`;

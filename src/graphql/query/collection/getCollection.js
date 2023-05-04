import { gql } from "@apollo/client";

export const ALL_COLLECTION_QUERY = gql`
    query collections(
        $pagination: PaginationArg
        $filter: CollectionFiltersInput
        $sort: [String]
    ) {
        collections(pagination: $pagination, filters: $filter, sort: $sort) {
            data {
                attributes {
                    name
                    logo {
                        data {
                            attributes {
                                name
                                alternativeText
                                caption
                                width
                                height
                                hash
                                ext
                                mime
                                size
                                url
                                previewUrl
                                provider
                                provider_metadata
                                createdAt
                            }
                        }
                    }
                    logoID
                    cover {
                        data {
                            attributes {
                                name
                                alternativeText
                                caption
                                width
                                height
                                hash
                                ext
                                mime
                                size
                                url
                                previewUrl
                                provider
                                provider_metadata
                                createdAt
                            }
                        }
                    }
                    coverID
                    featured {
                        data {
                            attributes {
                                name
                                alternativeText
                                caption
                                width
                                height
                                hash
                                ext
                                mime
                                size
                                url
                                previewUrl
                                provider
                                provider_metadata
                                createdAt
                            }
                        }
                    }
                    symbol
                    url
                    description
                    category
                    sharedSeo {
                        id
                        metaTitle
                        metaDescription
                        metaImage {
                            data {
                                attributes {
                                    name
                                    alternativeText
                                    caption
                                    width
                                    height
                                    hash
                                    ext
                                    mime
                                    size
                                    url
                                    previewUrl
                                    provider
                                    provider_metadata
                                    createdAt
                                }
                            }
                        }
                        metaSocial {
                            id
                            socialNetwork
                            title
                            description
                            image {
                                data {
                                    attributes {
                                        name
                                        alternativeText
                                        caption
                                        width
                                        height
                                        hash
                                        ext
                                        mime
                                        size
                                        url
                                        previewUrl
                                        provider
                                        provider_metadata
                                        createdAt
                                    }
                                }
                            }
                        }
                        keywords
                        metaRobots
                        structuredData
                        metaViewport
                        canonicalURL
                    }
                    explicitAndSensitiveContent
                    collectionType
                    contractAddress1155
                    contractAddress
                    payoutWalletAddress
                    creatorEarning
                    paymentTokens {
                        data {
                            attributes {
                                name
                                blockchain
                                createdAt
                            }
                        }
                    }
                    slug
                    ownerAddress
                    networkType
                }
            }
            meta {
                pagination {
                    total
                    page
                    pageSize
                    pageCount
                }
            }
        }
    }
`;

export const ALL_COLLECTION_LISTDATA_QUERY = gql`
query collections(
    $pagination: PaginationArg
    $filter: CollectionFiltersInput
    $sort: [String]
) {
    collections(pagination: $pagination, filters: $filter, sort: $sort) {
        data {
            attributes {
                name
                logo {
                    data {
                        attributes {
                            url
                        }
                    }
                }
                cover {
                    data {
                        attributes {
                            url
                        }
                    }
                }
                featured {
                    data {
                        attributes {
                            url
                        }
                    }
                }
                category
                collectionType
                slug
              collectibles{
                data{
                  id
                }
              }
            }
        }
        meta {
            pagination {
                total
                page
                pageSize
                pageCount
            }
        }
    }
}
`;

export const GET_COLLECTION_LISTDATA_QUERY = gql`
query Collections(
  $filters: CollectionFiltersInput
  $pagination: PaginationArg 
  $collectiblesFilters: CollectibleFiltersInput) {
  collections(filters: $filters,pagination: $pagination) {
    data {
      id
      attributes {
        category
        collectionType
        cover {
          data {
            attributes {
              url
            }
          }
        }
        logo {
          data {
            attributes {
              url
            }
          }
        }
        slug
        symbol
        url
        name
        networkType
        createdAt
        collectibles(filters: $collectiblesFilters) {
          data {
            id
            attributes {
              
          nftID
          name
          image {
            data{
              attributes{
                url
              }
            }
          }
          description
          external_url
          price
          symbol
          royalty
          supply
          creator
          owner
          collectionContractAddress
          putOnSale
          saleType
          instantSalePrice
          unlockPurchased
          slug
          collection{
            data{
              id
              attributes{
                name
                slug
              }
            }
          }
          auction{
            data{
              id
              attributes{
                walletAddress
                bidPrice
                priceCurrency
                startTimestamp
                endTimeStamp
                sellType
                biddings{
                  data{
                    attributes{
                      bidPrice
                      bidderAddress
                      timeStamp
                      auction{
                        data{
                          id
                        }
                      }
                      isAccepted
                      createdAt
                    }
                  }
                }
                quantity
                createdAt 
              }
            }
          }
          createdAt
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

import { gql } from "@apollo/client";

export const ALL_COLLECTIBLE_LISTDATA_QUERY = gql`
query collectibles(
  $pagination: PaginationArg
  $filter: CollectibleFiltersInput
  $sort: [String]
) {
  collectibles(pagination: $pagination, filters: $filter, sort: $sort) {
      data {
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
`;

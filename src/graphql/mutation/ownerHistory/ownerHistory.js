import { gql } from "@apollo/client";

export const CREATE_OWNER_HISTORY = gql`
mutation CreateOwnerHistory($data: OwnerHistoryInput!) {
    createOwnerHistory(data: $data) {
      data {
        id
        attributes {
          transactionHash
          toWalletAddress
          quantity
          fromWalletAddress
          event
          createdAt
          collectible {
            data {
              id
            }
          }
          auction {
            data {
              id
            }
          }
        }
      }
    }
  }
`;

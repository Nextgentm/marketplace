import { gql } from "@apollo/client";

export const UPDATE_COLLECTIBLE = gql`
mutation Mutation($data: CollectibleInput!, $updateCollectibleId: ID!) {
    updateCollectible(data: $data, id: $updateCollectibleId) {
      data {
        id
      }
    }
  }
  `;

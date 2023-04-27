import { gql } from "@apollo/client";

export const UPDATE_BIDDING = gql`
mutation Mutation($data: BiddingInput!, $updateBiddingId: ID!) {
  updateBidding(data: $data, id: $updateBiddingId) {
      data {
        id
      }
    }
  }
  `;

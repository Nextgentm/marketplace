import { gql } from "@apollo/client";

export const DO_LOGIN = gql`
mutation Login($input: UsersPermissionsLoginInput!) {
    login(input: $input) {
      jwt
      user {
        username
        role {
          id
          name
          type
          description
        }
        email
        confirmed
        blocked
        id
      }
    }
  }
  `;

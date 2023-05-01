import { gql } from "@apollo/client";

export const UPDATE_USER_PROFILE = gql`
mutation UpdateUsersPermissionsUser($updateUsersPermissionsUserId: ID!, $data: UsersPermissionsUserInput!) {
  updateUsersPermissionsUser(id: $updateUsersPermissionsUserId, data: $data) {
    data {
      id
      attributes {
        username
        email
        provider
        confirmed
        blocked
        mobileNumber
        type
        pin
        profilePic {
          data {
            attributes {
              name
              alternativeText
              caption
              mime
              size
              url
              previewUrl
              ext
            }
          }
        }
        banner {
            data {
            id
              attributes {
                name
                alternativeText
                caption
                hash
                ext
                mime
                size
                url
                previewUrl
                provider
                createdAt
                provider_metadata
              }
            }
          }
        about
        tagline
        fullName
        legacyUserId
        photoURL
        crypto_wallets {
          data {
            id
            attributes {
              type
            }
          }
        }
        socialLinks {
          id
          url
          socialNetwork
        }
        ready_player_me_url
        createdAt
      }
    }
  }
}

  `;

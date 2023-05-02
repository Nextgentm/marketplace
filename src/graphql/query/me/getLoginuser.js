import { gql } from "@apollo/client";

export const GET_LOGIN_USER = gql`
query UsersPermissionsUser {
    usersPermissionsUser {
      data {
        attributes {
          username
          email
          provider
          confirmed
          blocked
          role {
            data {
              attributes {
                name
                description
                type
                createdAt
              }
            }
          }
          mobileNumber
          type
          pin
          profilePic {
            data {
              attributes {
                name
                alternativeText
                caption
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
          socialLinks {
            id
            url
            socialNetwork
          }
          wallets {
            data {
              attributes {
                currency {
                  data {
                    attributes {
                      name
                      type
                      createdAt
                    }
                  }
                }
                balance
                createdAt
              }
            }
          }
          fullName
          legacyUserId
          photoURL
          crypto_wallets {
            data {
              attributes {
                type
                address
                isActive
                createdAt
              }
            }
          }
          wallet_validities {
            data {
              attributes {
                amount
                currency {
                  data {
                    attributes {
                      name
                      isRealMoney
                      type
                    }
                  }
                }
                validity
                expired
                unusedAmount
                createdAt
              }
            }
          }
          createdAt
          ready_player_me_url
        }
      }
    }
  }`;

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

import { ApolloClient, InMemoryCache, createHttpLink, split, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getLoginToken } from "src/lib/user";
import { isServer } from "./methods";
import { createUploadLink } from "apollo-upload-client";

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/graphql`
});

const authLink = setContext(async (_, req) => {
  const { headers } = req;
  const { isAuthenticated, token } = await getLoginToken();

  // Retrieve the access token from your authentication system
  return {
    headers: {
      ...headers,
      ...(isAuthenticated ? { Authorization: `Bearer ${token}` } : {})
    }
  };
});

const uploadLink = createUploadLink({
  uri: httpLink
});

const client = new ApolloClient({
  ssrMode: isServer() ? true : false,
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache()
});

export default client;

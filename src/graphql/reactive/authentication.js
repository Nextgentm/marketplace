import { makeVar } from "@apollo/client";

export const authenticationData = makeVar({
  isAuthenticated: false,
  token: "",
  user: {}
});

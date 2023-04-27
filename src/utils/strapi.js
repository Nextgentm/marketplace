import Strapi from "strapi-sdk-js";

const strapi = new Strapi({
  url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api`,
  store: {
    key: "strapi_jwt",
    useLocalStorage: true,
    cookieOptions: { path: "/" }
  },
  axiosOptions: {}
});
strapi.axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("error", error);
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
        case 403: {
          strapi.logout();
          if (location.pathname != "/") window.location.replace("/");
          break;
        }
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default strapi;

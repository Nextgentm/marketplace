import { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import sal from "sal.js";
import { ThemeProvider } from "next-themes";
import "../assets/css/bootstrap.min.css";
import "../assets/css/feather.css";
import "../assets/css/modal-video.css";
import "react-toastify/dist/ReactToastify.css";
import "../assets/scss/style.scss";
import "nprogress/nprogress.css";
import AppDataContext, { AppData } from "src/context/app-context";
import { ApolloProvider } from "@apollo/client";
import { loadNProgress } from "@utils/nprogress";
import client from "@utils/apollo-client";
/*import Snowfall from "react-snowfall"*/
import { GoogleOAuthProvider } from "@react-oauth/google";
import strapi from "@utils/strapi";
import { setCookie } from "@utils/cookies";
import { toast } from "react-toastify";

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();
  // 🔥 RESET reload flag so infinite reload stops
  // if (typeof window !== "undefined") {
  //   localStorage.removeItem("hasRefreshedAfterLogin");
  // }
  // const { loadUserData, onSignout } = useContext(AppData);
  const appData = useContext(AppData);   // <--- SAFE
  // const userDetails = JSON.parse(localStorage.getItem("user"));
  const userDetails = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  useEffect(() => {
    sal({ threshold: 0.1, once: true });
    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);
    let activeRequests = 0;
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      if (activeRequests === 0) {
        handleRouteStart();
      }

      activeRequests++;

      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        return Promise.reject(error);
      } finally {
        activeRequests -= 1;
        if (activeRequests === 0) {
          handleRouteDone();
        }
      }
    };
    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router.asPath]);

  useEffect(() => {
    sal();
    document.body.className = `${pageProps.className}`;
  }, [pageProps]);

  const getUserCollectibleLike = async (userId) => {
    try {
      let response = await strapi.find("collectible-user-likes", {
        filters: {
          user: userId,
        },
        populate: {
          user: {
            fields: ["id"],
          },
          collectible: {
            fields: ["id"],
          },
        }
      });
      return response;
    } catch (error) {
      return { data: [] };
    }
  }
  useEffect(() => {
    // Run only after user is logged in
    if (!userDetails) return;

    // console.log("Starting cookie watchdog...");

    const interval = setInterval(() => {
      if (userDetails) {
        const cookies = document?.cookie?.split("; ").reduce((acc, curr) => {
          const [name, value] = curr.split("=");
          acc[name] = value;
          return acc;
        }, {});

        let token = cookies["lovable-auth"]; // <-- read cookie
        if (!token) appData?.onSignout();
      }
    }, 5000); // every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [userDetails]);

  useEffect(() => {
    console.log(" use effect run ")
    let token = window?.localStorage?.getItem("token");
    const cookies = document?.cookie?.split("; ").reduce((acc, curr) => {
      const [name, value] = curr.split("=");
      acc[name] = value;
      return acc;
    }, {});

    if (!token) token = cookies["lovable-auth"]; // <-- read cookie
    if (token && !strapi.user) {
      strapi.setToken(token);
      strapi
        .request("GET", "/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(async (userData) => {
          let loginResponse = userData
          console.log(" loginResponse is ", loginResponse, userData)
          if (loginResponse?.id) {
            // strapi.setToken(token);
            // strapi.user = userData
            // // setLoggingIn(false)
            // setJwt(userData);

            const cookiesDate = new Date();
            cookiesDate.setTime(cookiesDate.getTime() + (120 * 60 * 1000));
            setCookie("token", token, { expires: cookiesDate });
            let likes = await getUserCollectibleLike(loginResponse?.id);
            if (loginResponse) loginResponse.liked_nft = likes
            console.log("loginResponse.user is ", loginResponse)
            window?.localStorage?.setItem("user", JSON.stringify(loginResponse));
            // toast.success("Logged In Successfully");
            // const appData = useContext(AppData);   // <--- SAFE
            // const interval = setInterval(async () => {
            //   console.log("interval start", appData)
            
            await appData?.loadUserData();
            await appData?.setUserData(loginResponse)
            console.log(" appData is ::::::: ", appData)
            // if(!appData) window.location.reload();
            if (!window?.localStorage?.getItem("hasRefreshedAfterLogin")) {
              window?.localStorage?.setItem("hasRefreshedAfterLogin", "true");
              window.location.reload();
            }
            // }, 2000); // every 5 seconds
            return;

            // getCurremtLocation().then(/* async */(res) => {
            //   window.localStorage.setItem("lm_user_location", res?.country);
            //   window.localStorage.setItem("lm_user_state", res?.state);
            //             /* const updatedSession = await */strapi.request('PATCH', '/sessions/location',
            //     { data: { state: res?.state, browserCountry: res?.country } }
            //   )
            // });
          }
          console.log(" game user Data is :::::: ", userData);
        }).catch((err) => {
          console.log(" game user Data err :::::: ", err);
        })
    }
  }, []);


  const handleRouteStart = async () => {
    const NProgress = await loadNProgress();
    NProgress.configure({ showSpinner: false });

    setTimeout(() => {
      NProgress && NProgress.start();
    }, 10);
  };

  const handleRouteDone = async () => {
    const NProgress = await loadNProgress();
    setTimeout(() => {
      NProgress && NProgress.done();
    }, 20);
  };
  return (
    <ApolloProvider client={client}>
      <AppDataContext>
        <ThemeProvider defaultTheme="dark">
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} >
            {/*<Snowfall
              // The color of the snowflake, can be any valid CSS color.
              color="#dee4fd"
              speed={[1.2, 1.3]}
              wind={[-0.5, -0.5]}
              // Controls the number of snowflakes that are created (defaults to 150).
              snowflakeCount={300}
              radius={[0.5, 3]}
            />*/}
            <Component {...pageProps} />
            <img style={{ display: "none" }} src="/assets/loader/loader.200.120kb.gif" width={200} height={200} alt="Loader..." />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </AppDataContext>
    </ApolloProvider>
  );
};

MyApp.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.shape({
    className: PropTypes.string
  })
};

export default MyApp;

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
import AppDataContext from "src/context/app-context";
import { ApolloProvider } from "@apollo/client";
import { loadNProgress } from "@utils/nprogress";
import client from "@utils/apollo-client";
//import Snowfall from "react-snowfall"
import { GoogleOAuthProvider } from "@react-oauth/google";

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();
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
            {/* 
          <Snowfall
            // The color of the snowflake, can be any valid CSS color.
            color="#dee4fd"
            speed={[1.2, 1.3]}
            wind={[-0.5, -0.5]}
            // Controls the number of snowflakes that are created (defaults to 150).
            snowflakeCount={300}
            radius={[0.5, 3]}
          />
           */}
            <Component {...pageProps} />
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

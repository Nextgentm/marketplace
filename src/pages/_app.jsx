import { useEffect } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import sal from "sal.js";
import { ThemeProvider } from "next-themes";
import "../assets/css/bootstrap.min.css";
import "../assets/css/feather.css";
import "../assets/css/modal-video.css";
import "react-toastify/dist/ReactToastify.css";
import "../assets/scss/style.scss";
import WalletDataContext from "src/context/wallet-context";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ApolloProvider } from "@apollo/client";
import client from "@utils/apollo-client";

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();
  useEffect(() => {
    sal({ threshold: 0.1, once: true });
  }, [router.asPath]);

  useEffect(() => {
    sal();
  }, []);
  useEffect(() => {
    document.body.className = `${pageProps.className}`;
  });

  return (
    <ApolloProvider client={client}>
      <WalletDataContext>
        <ThemeProvider defaultTheme="dark">
          <Component {...pageProps} />
        </ThemeProvider>
      </WalletDataContext>
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

import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import LoginArea from "@containers/login";
import { authenticationData } from "src/graphql/reactive/authentication";
import { userSessionData } from "src/lib/user";
import { isServer } from "@utils/methods";
import { getCookie } from "@utils/cookies";
import Router from "next/router";



const Login = () => (
  <Wrapper>
    <SEO pageTitle="Log In" />
    <Header />
    <main id="main-content">
      <LoginArea />
    </main>
    <Footer />
  </Wrapper>
);

Login.getInitialProps = async (ctx) => {
  if (!isServer()) {
    const { isAuthenticated } = userSessionData()
    console.log("isAuthenticated", isAuthenticated)
    if (isAuthenticated)
      Router.push("/")
  }
  else if (ctx.req.headers) {
    console.log("ctx.req.header.cookies", ctx.req.headers.cookie)
    const token = getCookie("token", ctx.req.headers.cookie)
    if (token) {
      ctx.res.writeHead(302, {
        Location: "/"
      });
    }
    ctx.res.end();
  }
  return { className: "template-color-1" };
}

export default Login;

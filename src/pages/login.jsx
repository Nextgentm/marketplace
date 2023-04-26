import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import LoginArea from "@containers/login";
import { userSessionData } from "src/lib/user";
import { isServer } from "@utils/methods";
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
  const { isAuthenticated } = await userSessionData(ctx)
  if (!isServer() && isAuthenticated) {
    Router.push("/")
  }
  else if (isAuthenticated) {
    ctx.res.writeHead(302, {
      Location: "/"
    });
    ctx.res.end();

  }

  return { className: "template-color-1" };
}

export default Login;

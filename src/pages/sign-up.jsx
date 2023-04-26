import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import SignUpArea from "@containers/signup";
import { userSessionData } from "src/lib/user";
import { isServer } from "@utils/methods";
import Router from "next/router";

const SignUp = () => (
  <Wrapper>
    <SEO pageTitle="Sign Up" />
    <Header />
    <main id="main-content">
      <SignUpArea />
    </main>
    <Footer />
  </Wrapper>
);

SignUp.getInitialProps = async (ctx) => {
  const { isAuthenticated } = await userSessionData(ctx);
  if (!isServer() && isAuthenticated) {
    Router.push("/");
  } else if (isAuthenticated) {
    ctx.res.writeHead(302, {
      Location: "/"
    });
    ctx.res.end();
  }

  return { className: "template-color-1" };
};

export default SignUp;

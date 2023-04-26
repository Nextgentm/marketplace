import PropTypes from "prop-types";
import clsx from "clsx";
import Image from "next/image";
import { useGoogleLogin } from "react-google-login";
import strapi from "@utils/strapi";
import { toast } from "react-toastify";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

const SocialAuth = ({ className, title }) => {
  const { signIn } = useGoogleLogin({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,

    onSuccess: (data) => {
      callAuthService("google", data.accessToken);
    }
  })
  const callAuthService = async (provider, token) => {
    try {
      const loginResponse = await strapi.authenticateProvider(provider, token);
      setCookie("token", loginResponse.jwt)
      localStorage.setItem("user", JSON.stringify(loginResponse.user))
      toast.success("Logged In Successfully")
      router.push("/");
    } catch ({ error }) {
      toast.error("Invalid login information")
      console.log(error);
      return;
    }
  }
  return (
    <div className={clsx("social-share-media form-wrapper-one", className)}>
      <h6>{title}</h6>
      <p>Lorem ipsum dolor sit, amet sectetur adipisicing elit.cumque.</p>
      <button type="button" className="another-login login-facebook" onClick={signIn}>
        <span className="small-image">
          <Image src="/images/icons/google.png" alt="google login" width={26} height={27} />
        </span>
        <span>Log in with Google</span>
      </button>
      <FacebookLogin
        appId={
          process.env
            .NEXT_PUBLIC_FACEBOOK_CLIENT_ID
        }
        callback={({ accessToken }) => {
          callAuthService(
            "facebook",
            accessToken
          );
        }}
        render={(renderProps) => (
          <button type="button" className="another-login login-facebook" onClick={renderProps.onClick}>
            <span className="small-image">
              <Image src="/images/icons/facebook.png" alt="facebook login" width={26} height={27} />
            </span>
            <span>Sign in with Facebook</span>
          </button>)} />

    </div>
  )
};

SocialAuth.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired
};
export default SocialAuth;

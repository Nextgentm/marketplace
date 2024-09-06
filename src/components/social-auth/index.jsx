import PropTypes from "prop-types";
import clsx from "clsx";
import Image from "next/image";
// import { useGoogleLogin } from "react-google-login";
import { useGoogleLogin } from "@react-oauth/google";
import strapi from "@utils/strapi";
import { toast } from "react-toastify";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { useRouter } from "next/router";
import { setCookie } from "@utils/cookies";

const SocialAuth = ({ className, title, loading, setLoading }) => {
  const router = useRouter();

  // const { signIn, signOut, isSignedIn } = useGoogleLogin({
  //   clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,

  //   onSuccess: (data) => {
  //     callAuthService("google", data.accessToken);
  //   }
  // });

  const signIn = useGoogleLogin({
    flow: "implicit",
    onSuccess: (data) => callAuthService("google", data.access_token),
    onError: () => setLoading(false),
  });

  const loginWidGoogle = () => {
    signIn()
  }

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
      return [{ data: [] }];
    }
  }

  const callAuthService = async (provider, token) => {
    try {
      if (loading) return
      setLoading(true)
      const loginResponse = await strapi.authenticateProvider(provider, token);
      setCookie("token", loginResponse.jwt);
      let likes = await getUserCollectibleLike(loginResponse.user?.id);
      if (loginResponse.user) loginResponse.user.liked_nft = likes
      localStorage.setItem("user", JSON.stringify(loginResponse.user));
      toast.success(`${router.pathname == "/sign-up" ? "Registration" : "Log in"} Successfull`);
      /* if (provider == "google" && isSignedIn) {
        signOut();
      } */
      // setLoading(false)
      router.push("/");
    } catch ({ error }) {
      toast.error("Invalid login information");
      setLoading(false)

      // signOut();
      return;
    }
  };

  return (
    <div className={clsx("social-share-media form-wrapper-one", className)}>
      <h6>{title}</h6>
      {/* <p>Lorem ipsum dolor sit, amet sectetur adipisicing elit.cumque.</p> */}
      <button type="button" className="another-login login-facebook" onClick={loginWidGoogle}>
        <span className="small-image">
          <Image src="/images/icons/google.png" alt="google login" width={26} height={27} />
        </span>
        <span>{router.pathname == "/sign-up" ? "Signup" : "Login"} with Google</span>
      </button>
      <FacebookLogin
        appId={process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}
        callback={({ accessToken }) => {
          callAuthService("facebook", accessToken);
        }}
        render={(renderProps) => (
          <button type="button" className="another-login login-facebook" onClick={renderProps.onClick}>
            <span className="small-image">
              <Image src="/images/icons/facebook.png" alt="facebook login" width={26} height={27} />
            </span>
            <span>{router.pathname == "/sign-up" ? "Signup" : "Login"} with Facebook</span>
          </button>
        )}
      />
    </div>
  );
};

SocialAuth.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired
};
export default SocialAuth;

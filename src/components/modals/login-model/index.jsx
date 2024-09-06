import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { useContext, useState } from "react";
import ErrorText from "@ui/error-text";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import Image from "next/image";
import { useGoogleLogin } from "@react-oauth/google";
import strapi from "@utils/strapi";
import { toast } from "react-toastify";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { useRouter } from "next/router";
import { setCookie } from "@utils/cookies";
import { AppData } from "src/context/app-context";

const LoginModel = ({ show, handleModal }) => {
    const router = useRouter();

    const { loadUserData } = useContext(AppData);

    const [selectedOption, setSelectedOption] = useState("login");

    const signIn = useGoogleLogin({
        flow: "implicit",
        onSuccess: (data) => callAuthService("google", data.access_token),
        // onError: () => setLoggingIn(false) ,
    });

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
    const loginWidGoogle = () => {
        signIn()
    }

    const callAuthService = async (provider, token) => {
        try {
            const loginResponse = await strapi.authenticateProvider(provider, token);
            setCookie("token", loginResponse.jwt);
            let likes = await getUserCollectibleLike(loginResponse.user?.id);
            if (loginResponse.user) loginResponse.user.liked_nft = likes
            localStorage.setItem("user", JSON.stringify(loginResponse.user));
            toast.success(`${selectedOption == "/sign-up" ? "Registration" : "Logged In"} Successfully`);
            /* if (provider == "google" && isSignedIn) {
              signOut();
            } */
            await loadUserData();
        } catch ({ error }) {
            toast.error("Invalid login information");
            // signOut();
            return;
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        mode: "onChange"
    });

    const onSubmit = async (data, e) => {
        e.preventDefault();
        // eslint-disable-next-line no-console
        if (data.identifier && data.password) {
            try {
                let loginResponse = await strapi.login({
                    identifier: data.identifier,
                    password: data.password
                });

                const cookiesDate = new Date();
                cookiesDate.setTime(cookiesDate.getTime() + (120 * 60 * 1000));
                setCookie("token", loginResponse.jwt, { expires: cookiesDate });
                let likes = await getUserCollectibleLike(loginResponse.user?.id);
                if (loginResponse.user) loginResponse.user.liked_nft = likes
                localStorage.setItem("user", JSON.stringify(loginResponse.user));
                toast.success("Logged In Successfully");
                await loadUserData();
                return;
            } catch ({ error }) {
                toast.error("Invalid login information");
                return;
            }
        }
    };

    return (
        <Modal className="rn-popup-modal placebid-modal-wrapper" show={show} onHide={handleModal} centered>
            {show && (
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header>
                <h4 className="modal-title">{selectedOption === "login" ? "LOGIN" : "SIGNUP"}</h4>
            </Modal.Header>
            <Modal.Body className={clsx("form-wrapper-one")}>
                <div >
                    <div>
                        <button type="button" className="another-login login-facebook" onClick={loginWidGoogle}>
                            <span className="small-image">
                                <Image src="/images/icons/google.png" alt="google login" width={26} height={27} />
                            </span>
                            <span>{selectedOption == "login" ? "Login" : "Signup"} with Google</span>
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
                                    <span>{selectedOption == "login" ? "Login" : "Signup"} with Facebook</span>
                                </button>
                            )}
                        />
                    </div>
                    <div className="mt-2">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-3">
                                <label htmlFor="identifier" className="form-label">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="identifier"
                                    {...register("identifier", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                            message: "invalid email address"
                                        }
                                    })}
                                />
                                {errors.identifier && <ErrorText>{errors.identifier?.message}</ErrorText>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    {...register("password", {
                                        required: "Password is required"
                                    })}
                                />
                                {errors.password && <ErrorText>{errors.password?.message}</ErrorText>}
                            </div>
                            <div className="mb-5 rn-check-box">
                                <input type="checkbox" className="rn-check-box-input" id="rememberMe" {...register("rememberMe")} />
                                <label className="rn-check-box-label" htmlFor="rememberMe">
                                    Remember me later
                                </label>
                            </div>
                            <Button onClick={() => setSelectedOption("login")} type={selectedOption === "login" ? "submit" : ""} size="medium" className="mr-15">
                                Log In
                            </Button>

                            <div className="mt-2 rn-check-box text-center">
                                {selectedOption === "login"
                                    ? <label>New to LootMogul? <a onClick={() => setSelectedOption("signup")}>Sign Up</a></label>
                                    : <label>Already user? <a onClick={() => setSelectedOption("login")}>Login</a></label>}
                            </div>
                        </form>
                    </div>
                </div>
            </Modal.Body>
        </Modal >
    );
};

LoginModel.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired
};
export default LoginModel;

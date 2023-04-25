import PropTypes from "prop-types";
import clsx from "clsx";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { DO_LOGIN } from "src/graphql/mutation/login";
import { useMutation } from "@apollo/client";
import { useEffect } from "react";
import { authenticationData } from "src/graphql/reactive/authentication";
import { setCookie } from "@utils/cookies";

const LoginForm = ({ className }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: "onChange"
  });

  const [doLogin, { loading, data: loginResponse, error }] = useMutation(DO_LOGIN)

  useEffect(() => {
    console.log("loginResponse", loginResponse)
    if (!loading && loginResponse && loginResponse.login) {
      setCookie("token", loginResponse.login.jwt)
      authenticationData({
        isAuthenticated: true,
        token: loginResponse.login.jwt,
        user: loginResponse.login.user
      })
    }
  }, [loginResponse, loading])

  const onSubmit = (data, e) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    if (data.identifier && data.password) {
      doLogin({
        variables: {
          input: {
            identifier: data.identifier,
            password: data.password,
            provider: "local"
          }
        }
      })
    }
    console.log(data);

  };


  return (
    <div className={clsx("form-wrapper-one", className)}>
      <h4>Login</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
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
        <div className="mb-5">
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
            Remember me leter
          </label>
        </div>
        <Button type="submit" size="medium" className="mr--15">
          Log In
        </Button>
        <Button path="/sign-up" color="primary-alta" size="medium">
          Sign Up
        </Button>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  className: PropTypes.string
};
export default LoginForm;

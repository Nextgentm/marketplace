import PropTypes from "prop-types";
import clsx from "clsx";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { setCookie } from "@utils/cookies";
import strapi from "@utils/strapi";
import { toast } from "react-toastify";

const LoginForm = ({ className, loading, setLoading }) => {
  const router = useRouter();
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
    if (loading) return

    if (data.identifier && data.password) {
      try {
        setLoading(true)
        let loginResponse = await strapi.login({
          identifier: data.identifier,
          password: data.password
        });

        const cookiesDate = new Date();
        cookiesDate.setTime(cookiesDate.getTime() + (120 * 60 * 1000));
        setCookie("token", loginResponse.jwt, { expires: cookiesDate });
        localStorage.setItem("user", JSON.stringify(loginResponse.user));
        toast.success("Logged In Successfully");
        router.push("/");
        // setLoading(false)
      } catch ({ error }) {
        toast.error("Invalid login information");
        setLoading(false)
        return;
      }

    }
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
            Remember me later
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

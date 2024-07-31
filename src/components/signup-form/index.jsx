import PropTypes from "prop-types";
import clsx from "clsx";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import strapi from "@utils/strapi";
import { setCookie } from "@utils/cookies";
import { toast } from "react-toastify";

const SignupForm = ({ className, loading, setLoading }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
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
        let loginResponse = await strapi.register({
          username: data.username,
          identifier: data.identifier,
          password: data.password
        });

        setCookie("token", loginResponse.jwt);
        localStorage.setItem("user", JSON.stringify(loginResponse.user));
        toast.success("Registration Successfully");
        router.push("/");
      } catch ({ error }) {
        toast.error(error.message);
        setLoading(false)
        return;
      }

    }
  };

  return (
    <div className={clsx("form-wrapper-one", className)}>
      <h4>Sign Up</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            {...register("username", {
              required: "username is required"
            })}
          />
          {errors.username && <ErrorText>{errors.username?.message}</ErrorText>}
        </div>
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
          <label htmlFor="newPassword" className="form-label">
            Create Password
          </label>
          <input
            type="password"
            id="newPassword"
            {...register("newPassword", {
              required: "Password is required"
            })}
          />
          {errors.newPassword && <ErrorText>{errors.newPassword?.message}</ErrorText>}
        </div>
        <div className="mb-5">
          <label htmlFor="password" className="form-label">
            Re-enter Password
          </label>
          <input
            type="password"
            id="password"
            {...register("password", {
              required: "Confirm Password is required",
              validate: (value) => value === getValues("newPassword") || "The passwords do not match"
            })}
          />
          {errors.password && <ErrorText>{errors.password?.message}</ErrorText>}
        </div>
        <div className="mb-5 rn-check-box">
          <input
            type="checkbox"
            className="rn-check-box-input"
            id="exampleCheck1"
            {...register("exampleCheck1", {
              required: "Checkbox is required"
            })}
          />
          <label className="rn-check-box-label" htmlFor="exampleCheck1">
            Allow to all tearms & Allow to all tearms & condition
          </label>
          <br />
          {errors.exampleCheck1 && <ErrorText>{errors.exampleCheck1?.message}</ErrorText>}
        </div>
        <Button type="submit" size="medium" className="mr--15">
          Sign Up
        </Button>
        <Button path="/login" color="primary-alta" size="medium">
          Log In
        </Button>
      </form>
    </div>
  );
};

SignupForm.propTypes = {
  className: PropTypes.string
};
export default SignupForm;

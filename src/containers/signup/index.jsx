import PropTypes from "prop-types";
import clsx from "clsx";
import SignupForm from "@components/signup-form";
import SocialAuth from "@components/social-auth";
import AppLoader from "@components/AppLoader";
import { useState } from "react";

const SignupArea = ({ className, space }) => {
  const [loading, setLoading] = useState(false)

  return (
    <div className={clsx("login-area", space === 1 && "rn-section-gapTop", className)}>
      <div className="container">
        <div className="row g-5">
          <div className="offset-2 col-lg-4 col-md-6 ml_md--0 ml_sm--0 col-sm-12">
            <SocialAuth title="Another way to sign up" loading={loading} setLoading={setLoading} />

          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <SignupForm loading={loading} setLoading={setLoading} />
          </div>
          <div>
            {loading && <AppLoader />}
          </div>
        </div>
      </div>
    </div>
  )
}

SignupArea.propTypes = {
  className: PropTypes.string,
  space: PropTypes.oneOf([1])
};

SignupArea.defaultProps = {
  space: 1
};
export default SignupArea;

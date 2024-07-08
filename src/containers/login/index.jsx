import PropTypes from "prop-types";
import clsx from "clsx";
import LoginForm from "@components/login-form";
import SocialAuth from "@components/social-auth";
import { useEffect } from "react";
import { doLogOut } from "src/lib/user";
import { useState } from "react";
import AppLoader from "@components/AppLoader";

const LoginArea = ({ className, space }) => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    doLogOut()
  }, [])
  return (
    <div className={clsx("login-area", space === 1 && "rn-section-gapTop", className)}>
      <div className="container">
        <div className="row g-5">
          <div className="offset-2 col-lg-4 col-md-6 ml_md--0 ml_sm--0 col-sm-12">
            <SocialAuth title="Another way to log in" loading={loading} setLoading={setLoading} />
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <LoginForm loading={loading} setLoading={setLoading} />
          </div>
          <div>
            {loading && <AppLoader />}
          </div>
        </div>
      </div>
    </div>
  )
};

LoginArea.propTypes = {
  className: PropTypes.string,
  space: PropTypes.oneOf([1])
};

LoginArea.defaultProps = {
  space: 1
};
export default LoginArea;

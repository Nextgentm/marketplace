import PropTypes from "prop-types";
import clsx from "clsx";
import Anchor from "@ui/anchor";

const Breadcrumb = ({ pageTitle, currentPage, className, space, isCollection, extraCrumb }) => {
  return (
    <div className={clsx("rn-breadcrumb-inner", className, space === 1 && "ptb--30")}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-6 col-12">
            <h5 className="pageTitle text-center text-md-start">{pageTitle}</h5>
          </div>
          <div className="col-lg-6 col-md-6 col-12">
            <ul className="breadcrumb-list">
              <li className="item">
                <Anchor path="/">Home</Anchor>
              </li>
              {isCollection && (
                <>
                  <li className="separator">
                    <i className="feather-chevron-right" />
                  </li>
                  <li className="item">
                    <Anchor path="/collection">Collection</Anchor>
                  </li>
                </>
              )}
              {extraCrumb && extraCrumb.length > 0 ? (
                extraCrumb.map((item, index) => (
                  <>
                    <li className="separator">
                      <i className="feather-chevron-right" />
                    </li>
                    {index === extraCrumb.length - 1 ? (
                      <li className="item current">{item.name}</li>
                    ) : (
                      <li className="item">
                        <Anchor path={item.path}>{item.name}</Anchor>
                      </li>
                    )}
                  </>
                ))
              ) : (
                <>
                  <li className="separator">
                    <i className="feather-chevron-right" />
                  </li>
                  <li className="item current">{currentPage || pageTitle}</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

Breadcrumb.propTypes = {
  pageTitle: PropTypes.string.isRequired,
  currentPage: PropTypes.string,
  className: PropTypes.string,
  space: PropTypes.oneOf([1])
};

Breadcrumb.defaultProps = {
  space: 1
};

export default Breadcrumb;

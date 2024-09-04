import PropTypes from "prop-types";
import clsx from "clsx";
import ShareDropdown from "../share-dropdown";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import strapi from "@utils/strapi";
import LoginModel from "@components/modals/login-model";

const ProductTitle = ({ className, title, likeCount: initialLikeCount, userId, collectibleId }) => {

  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loginModal, setLoginModal] = useState(false);
  useEffect(() => {
    if (userId) {
      setLoginModal(false);
    }
  }, [userId]);
  const handleLikeClick = async () => {
    try {

      if (!userId || !collectibleId) {
        /**
         * show popup
         */
        // toast.error("Please login.");
        setLoginModal(true);
        return;
      }

      let response = await strapi.find("collectible-like", {
        filters: {
          userId,
          collectibleId
        }
      });
      setLikeCount((prevCount) => response?.totalCount ? response?.totalCount : 0);
    } catch (error) {
      console.error("Error liking the product:", error);
    }
  };

  return (
    <>
      <div className={clsx("pd-title-area", className)}>
        <h4 className="title" style={{ fontFamily: "inherit !important" }}>{title}</h4>
        <div className="pd-react-area">
          <div className="heart-count" onClick={handleLikeClick}>
            <i className="feather-heart" />
            <span>{likeCount}</span>
          </div>
          <div className="count">
            <ShareDropdown />
          </div>
        </div>
        {
          loginModal &&
          <LoginModel show={loginModal} handleModal={() => setLoginModal(!loginModal)} />
        }
      </div>
    </>
  )
};

ProductTitle.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  likeCount: PropTypes.number
};

ProductTitle.defaultProps = {
  likeCount: 0
};

export default ProductTitle;
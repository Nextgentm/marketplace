import PropTypes from "prop-types";
import clsx from "clsx";
import ShareDropdown from "../share-dropdown";
import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import strapi from "@utils/strapi";
import LoginModel from "@components/modals/login-model";
import { AppData } from "src/context/app-context";

const ProductTitle = ({ className, title, likeCount: initialLikeCount, userId, collectibleId }) => {

  let {
    userData,
    setUserLikeData
  } = useContext(AppData);
  // state for user nft like or not
  const [isUserLike, setUserLike] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loginModal, setLoginModal] = useState(false);
  useEffect(() => {
    if (userId) {
      setLoginModal(false);
      if (userData && userData.liked_nft?.data?.length > 0) {
        let value = userData.liked_nft.data.find((value) => value.collectible.data.id === collectibleId)
        if (value) setUserLike(true)
      }
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
      if (response && userData && userData.liked_nft?.data) {
        let value = userData.liked_nft.data.findIndex((item) => item.collectible.data.id === collectibleId)
        if (value != -1) {
          let likedData = userData.liked_nft.data.filter(item => item.collectible.data.id !== collectibleId);
          userData.liked_nft.data = likedData
          setUserLike(false);
        } else {
          userData.liked_nft.data.push({ collectible: { data: { id: collectibleId } } })
          setUserLike(true);
        }
        setUserLikeData(userData);
      }
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
            {isUserLike ? <i className="feather-hearts" style={{ marginRight: "8px", marginBottom: "2px" }} /> : <i className="feather-heart" />}
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
import { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Image from "next/image";
import { ImageType } from "@utils/types";
import ShareDropdown from "@components/share-dropdown";
import ShareModal from "@components/modals/share-modal";
import Anchor from "@ui/anchor";

const AuthorIntroArea = ({ className, space, data }) => {
  // console.log("data*-*-*-*-*-**-+0", data);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const shareModalHandler = () => setIsShareModalOpen((prev) => !prev);
  const twitterAccount = data?.socialLinks?.find((i) => {
    return i?.socialNetwork == "twitter";
  });
  // console.log("twitterAccount", twitterAccount);
  // <img
  //         src={data?.banner?.url}
  //         alt="Slider BG"
  //         quality={100}
  //         priority
  //         fill
  //         sizes="100vw"
  //         style={{
  //           objectFit: "cover"
  //         }}
  return (
    <>
      <ShareModal show={isShareModalOpen} handleModal={shareModalHandler} />
      <div className="rn-author-bg-area position-relative ptb--150">
        <Image
          src={data?.banner?.url ? data?.banner?.url : "/images/profile/cover-04.jpg"}
          alt="Slider BG"
          quality={100}
          priority
          fill
          sizes="100vw"
          style={{
            objectFit: "cover"
          }}
        />

      </div>
      <div className={clsx("rn-author-area", space === 1 && "mb--30 mt_dec--120", className)}>
        <div className="container">
          <div className="row padding-tb-50 align-items-center d-flex">
            <div className="col-lg-12">
              <div className="author-wrapper">
                <div className="author-inner">
                  {data?.photoURL && (
                    <div className="user-thumbnail" style={{ backgroundColor: "#f6f6f6" }}>
                      <img
                        src={data?.photoURL}
                        alt={data?.fullName || data?.username || data?.email}
                        width={140}
                        height={140}
                      />
                    </div>
                  )}

                  <div className="rn-author-info-content">
                    <h4 className="title">{data?.fullName || data?.username || data?.email}</h4>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-follw">
                      <i className="feather-twitter" />
                      <span className="user-name">{twitterAccount?.url}</span>
                    </a>
                    {/* <div className="follow-area">
                      <div className="follow followers">
                        <span>
                          {data?.followers}{" "}
                          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="color-body">
                            followers
                          </a>
                        </span>
                      </div>
                      <div className="follow following">
                        <span>
                          {data?.following}{" "}
                          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="color-body">
                            following
                          </a>
                        </span>
                      </div>
                    </div> */}
                    <div className="author-button-area">
                      <span className="btn at-follw follow-button">
                        <i className="feather-user-plus" />
                        Follow
                      </span>
                      <button type="button" className="btn at-follw share-button" onClick={shareModalHandler}>
                        <i className="feather-share-2" />
                      </button>

                      <div className="count at-follw">
                        <ShareDropdown />
                      </div>
                      <Anchor path="/edit-profile" className="btn at-follw follow-button edit-btn">
                        <i className="feather feather-edit" />
                      </Anchor>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

AuthorIntroArea.propTypes = {
  className: PropTypes.string,
  space: PropTypes.oneOf([1]),
  data: PropTypes.shape({
    name: PropTypes.string,
    twitter: PropTypes.string,
    followers: PropTypes.string,
    following: PropTypes.string,
    image: ImageType
  })
};
AuthorIntroArea.defaultProps = {
  space: 1
};

export default AuthorIntroArea;

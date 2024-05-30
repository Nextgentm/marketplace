/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useContext } from "react";
import Image from "next/image";
import Modal from "react-bootstrap/Modal";
import { AppData } from "src/context/app-context";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PROFILE } from "src/graphql/mutation/userProfile/updateUserProfile";
import { toast } from "react-toastify";
import { normalize } from "@utils/methods";
import { CREATE_UPLOAD_MUTATION } from "src/graphql/mutation/userProfile/createuploadbanner";

const subdomain = "lootmogul";

const EditProfileImage = () => {
  const { userData: authorData, setUserDataLocal } = useContext(AppData);
  // console.log("authorData", authorData);
  const [selectedImage, setSelectedImage] = useState({
    profile: "",
    cover: {}
  });
  const [file, setFile] = useState(null);
  const [createUpload, { data, error }] = useMutation(CREATE_UPLOAD_MUTATION, { fetchPolicy: "network-only" });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const shareModalHandler = () => setIsShareModalOpen((prev) => !prev);
  const [showIFrame, setShowIFrame] = useState(true);
  const iFrameRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [updateUserProfile, { data: updatedUserProfile, loading }] = useMutation(UPDATE_USER_PROFILE, {
    fetchPolicy: "network-only"
  });
  // console.log("loading", loading)

  useEffect(() => {
    if (avatarUrl) {
      setSelectedImage({ ...selectedImage, profile: avatarUrl });
      updateUserProfile({
        variables: {
          updateUsersPermissionsUserId: authorData.id,
          data: {
            ready_player_me_url: avatarUrl,
            photoURL: avatarUrl
          }
        }
      });
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (data) {
      setSelectedImage({ ...selectedImage, cover: normalize(data) });


    }
  }, [data]);

  useEffect(() => {
    if (updatedUserProfile) {
      console.log("normalize(updatedUserProfile", normalize(updatedUserProfile));
      setUserDataLocal(normalize(updatedUserProfile).updateUsersPermissionsUser);
      toast.success("Profile Image Updated Successfully");
    }
  }, [updatedUserProfile]);

  useEffect(() => {
    if (data) {
      toast.success("Banner Image Updated Successfully");
      // setUserDataLocal(normalize(createUpload)?.updateUsersPermissionsUser);
    }
  }, [data]);

  const handleFileChange = async (event) => {
    if (event.target.files[0]) {
      const reader = new FileReader();
      const url = reader.readAsDataURL(event.target.files[0]);

      reader.onloadend = function (e) {
        console.log(e)
        setFile(e.target.result)
      }
      const formUpdateImage = new FormData();
      formUpdateImage.append("files", event.target.files[0]);

      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`, {
        method: "post",
        body: formUpdateImage
      })
        .then((response) => response.json())
        .then((res) => {
          if (res[0]) {
            updateUserProfile({
              variables: {
                updateUsersPermissionsUserId: authorData.id,
                data: {
                  banner: res[0]?.id
                }
              }
            });
          }
        });
    }
  }

  const imageChange = (e) => {
    setIsShareModalOpen(true);
    setIsShareModalOpen(true);
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage((prev) => ({
        ...prev,
        [e.target.name]: avatarUrl
      }));
    }
  };

  useEffect(() => {
    let iFrame = iFrameRef.current;
    if (iFrame) {
      iFrame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
    }
  }, [isShareModalOpen]);

  useEffect(() => {
    window.addEventListener("message", subscribe);
    document.addEventListener("message", subscribe);
    return () => {
      window.removeEventListener("message", subscribe);
      document.removeEventListener("message", subscribe);
    };
  }, [isShareModalOpen]);

  function subscribe(event) {
    const json = parse(event);
    if (json?.source !== "readyplayerme") {
      return;
    }
    // Subscribe to all events sent from Ready Player Me
    // once frame is ready
    if (json.eventName === "v1.frame.ready") {
      let iFrame = iFrameRef.current;
      if (iFrame && iFrame.contentWindow) {
        iFrame.contentWindow.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**"
          }),
          "*"
        );
      }
    }
    // Get avatar GLB URL
    if (json.eventName === "v1.avatar.exported") {
      console.log(`Avatar URL: ${json.data.url}`);
      let text = json.data.url;
      let result = text.replace("glb", "png");

      setAvatarUrl(result);
      setShowIFrame(false);
      setIsShareModalOpen(false);
    }
    // Get user id
    if (json.eventName === "v1.user.set") {
      console.log(`User with id ${json.data.id} set:
            ${JSON.stringify(json)}`);
    }
  }

  function parse(event) {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      return null;
    }
  }

  const ShareModal = ({ show, handleModal }) => (
    <Modal
      className="rn-popup-modal share-modal-wrapper"
      show={show}
      onHide={handleModal}
      centered
      dialogClassName="modal-800px"
    >
      {show && (
        <button type="button" className="btn-close" aria-label="Close" onClick={handleModal}>
          <i className="feather-x" />
        </button>
      )}
      <Modal.Body>
        <iframe
          allow="camera *; microphone *"
          className="iFrame"
          id="frame"
          ref={iFrameRef}
          style={{
            display: `${showIFrame ? "block" : "none"}`
          }}
          title={"Ready Player Me"}
        />
      </Modal.Body>
    </Modal>
  );

  return (
    <div className="nuron-information">
      <ShareModal show={isShareModalOpen} handleModal={shareModalHandler} />
      <div className="profile-change row g-5">
        <div className="profile-left col-lg-4">
          <div className="profile-image mb--30">
            <h6 className="title">Change Your Profile Picture</h6>
            <div className="img-wrap">
              {authorData?.photoURL || avatarUrl ? (
                <img src={avatarUrl || authorData?.photoURL} alt="" data-black-overlay="6" />
              ) : (
                <Image
                  id="rbtinput1"
                  src="/images/profile/profile-01.jpg"
                  alt="Profile-NFT"
                  priority
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: "cover"
                  }}
                />
              )}
            </div>
          </div>
          <div className="button-area">
            <div className="brows-file-wrapper">
              <input name="profile" id="fatima" type="button" onClick={(e) => imageChange(e)} />
              <label htmlFor="fatima" title="No File Choosen">
                <span className="text-center color-white">Upload Profile</span>
              </label>
            </div>
          </div>
        </div>

        <div className="profile-left right col-lg-8">
          <div className="profile-image mb--30">
            <h6 className="title">Change Your Cover Photo</h6>
            <div className="img-wrap">
              {authorData?.banner?.url || file ? (
                <img src={file || authorData?.banner?.url} alt="" data-black-overlay="6" />
              ) : (
                <Image
                  id="rbtinput2"
                  src="/images/profile/cover-01.jpg"
                  alt="Profile-NFT"
                  priority
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: "cover"
                  }}
                />
              )}
            </div>
          </div>
          <div className="button-area">
            <div className="brows-file-wrapper">
              <input name="cover" id="nipa" type="file" onChange={(e) => handleFileChange(e)} />
              <label htmlFor="nipa" title="No File Choosen">
                <span className="text-center color-white">Upload Cover</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileImage;

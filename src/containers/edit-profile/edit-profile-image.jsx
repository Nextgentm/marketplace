/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Modal from "react-bootstrap/Modal";

const EditProfileImage = () => {
    let imageAvtar = ''
    if (typeof window !== 'undefined') {
        imageAvtar = localStorage.getItem('image3dAvtar')
    }
    const [selectedImage, setSelectedImage] = useState({
        profile: imageAvtar,
        cover: "",
    });
    const imageChange = (e) => {
        setIsShareModalOpen(true);
        setIsShareModalOpen(true);
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage((prev) => ({
                ...prev,
                [e.target.name]: avatarUrl,
            }));
        }
    };
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const shareModalHandler = () => setIsShareModalOpen((prev) => !prev);
    const [showIFrame, setShowIFrame] = useState(true)
    const subdomain = 'lootmogul'
    const iFrameRef = useRef(null)
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        let iFrame = iFrameRef.current
        if(iFrame) {
           iFrame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`
        }
    })
    
    useEffect(() => {
        window.addEventListener('message', subscribe)
        document.addEventListener('message', subscribe)
        return () => {
            window.removeEventListener('message', subscribe)
            document.removeEventListener('message', subscribe)
        }
    });

    function subscribe(event) {
        const json = parse(event)
        if (json?.source !== 'readyplayerme') {
          return;
        }
        // Subscribe to all events sent from Ready Player Me 
        // once frame is ready
        if (json.eventName === 'v1.frame.ready') {
          let iFrame = iFrameRef.current
          if(iFrame && iFrame.contentWindow) {
            iFrame.contentWindow.postMessage(
              JSON.stringify({
                target: 'readyplayerme',
                type: 'subscribe',
                eventName: 'v1.**'
              }),
              '*'
            );
          }
        }
        // Get avatar GLB URL
        if (json.eventName === 'v1.avatar.exported') {
          console.log(`Avatar URL: ${json.data.url}`);
          let text = json.data.url
          let result = text.replace("glb", "png");
          localStorage.setItem('image3dAvtar', result);

          setAvatarUrl(result)
          setShowIFrame(false);
          setIsShareModalOpen(false);
          setIsShareModalOpen(false);
        }
        // Get user id
        if (json.eventName === 'v1.user.set') {
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
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleModal}
                >
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
                        display: `${showIFrame ? 'block': 'none'}`
                    }}
                    title={"Ready Player Me"}
                />
            </Modal.Body>
        </Modal>
    );
    
   
    
    return (
        <div className="nuron-information">
            <ShareModal
                show={isShareModalOpen}
                handleModal={shareModalHandler}
            />
            <div className="profile-change row g-5">
                <div className="profile-left col-lg-4">
                    <div className="profile-image mb--30">
                        <h6 className="title">Change Your Profile Picture</h6>
                        <div className="img-wrap">
                            {selectedImage?.profile ? (
                                <img
                                    src={
                                        selectedImage?.profile
                                    }
                                    alt=""
                                    data-black-overlay="6"
                                />
                            ) : (
                                <Image
                                    id="rbtinput1"
                                    src="/images/profile/profile-01.jpg"
                                    alt="Profile-NFT"
                                    priority
                                    fill
                                    sizes="100vw"
                                    style={{
                                        objectFit: "cover",
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="button-area">
                        <div className="brows-file-wrapper">
                            <input
                                name="profile"
                                id="fatima"
                                type="button"
                                onClick={imageChange}
                            />
                            <label htmlFor="fatima" title="No File Choosen">
                                <span className="text-center color-white">
                                    Upload Profile
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="profile-left right col-lg-8">
                    <div className="profile-image mb--30">
                        <h6 className="title">Change Your Cover Photo</h6>
                        <div className="img-wrap">
                            {selectedImage?.cover ? (
                                <img
                                    src={URL.createObjectURL(
                                        selectedImage.cover
                                    )}
                                    alt=""
                                    data-black-overlay="6"
                                />
                            ) : (
                                <Image
                                    id="rbtinput2"
                                    src="/images/profile/cover-01.jpg"
                                    alt="Profile-NFT"
                                    priority
                                    fill
                                    sizes="100vw"
                                    style={{
                                        objectFit: "cover",
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="button-area">
                        <div className="brows-file-wrapper">
                            <input
                                name="cover"
                                id="nipa"
                                type="file"
                                onChange={imageChange}
                            />
                            <label htmlFor="nipa" title="No File Choosen">
                                <span className="text-center color-white">
                                    Upload Cover
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfileImage;

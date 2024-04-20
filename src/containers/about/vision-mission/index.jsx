import PropTypes from "prop-types";
import clsx from "clsx";
import Image from "next/image";
import SectionTitle from "@components/section-title/layout-02";
import AboutCard from "@components/about-card";
import Sticky from "@ui/sticky";
import { ImageType, ItemType, SectionTitleType } from "@utils/types";

const AboutVisionMission = ({ space, className, data }) => (
    <div className={clsx("rn-about-banner-area", space === 1 && "rn-section-gapTop", className)}>
        <div className="container">
            <div className="row g-5">
                <div className="col-2 col-lg-4 text-end">
                    <div className="h--100">
                        <div className="img-wrapper">
                            <Image
                                src="/images/left-icon.png"
                                alt={"Icon"}
                                quality={100}
                                priority
                                width={"100"}
                                height="100"
                            />
                        </div>
                    </div>
                </div>
                <div className="col-8 col-lg-4 text-center">
                    <div className="h--100" style={{ display: "grid", alignItems: "center", justifyItems: "center" }}>
                        <h2 className="vision-mission">VISION & MISSION</h2>
                    </div>
                </div>
                <div className="col-2 col-lg-4 text-start">
                    <div className="h--100">
                        <div className="img-wrapper">
                            <Image
                                src="/images/right-icon.png"
                                alt={"Icon"}
                                quality={100}
                                priority
                                width={"100"}
                                height="100"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-left m-5" style={{ marginLeft: "15% !important" }}>
                <p style={{ color: "#fff" }}><b style={{ color: "#e90a63" }}>Vision:</b>  Revolutionizing Athlete Engagement with Simple and Innovative Web3 Sports Economy</p>
            </div>
            <div className="row m-2 visionbg">
                <div className="col-lg-4">
                    <div style={{
                        backgroundImage: "url('/images/bg/vision.png')", height: "188px", backgroundSize: "contain", display: "flex", marginTop:
                            "25px"
                    }}>
                        <div style={{ margin: "10% 10% 10% 15%", padding: "0 5% 0 10%", display: "flex", alignItems: "center", justifyItems: "center" }}>
                            <p style={{ color: "#fff" }}><b style={{ color: "#e90a63", display: "contents" }}>Athletes</b> engage with fans using multi-player blockchain games, training academies & metashops</p>
                        </div>

                    </div>
                </div>
                <div className="col-lg-4">
                    <div style={{
                        backgroundImage: "url('/images/bg/vision.png')", height: "188px", backgroundSize: "contain", display: "flex", marginTop:
                            "25px"
                    }}>
                        <div style={{ margin: "10% 10% 10% 15%", padding: "0 5% 0 10%", display: "flex", alignItems: "center", justifyItems: "center" }}>
                            <p style={{ color: "#fff" }}><b style={{ color: "#e90a63", display: "contents" }}>Brands</b> engage with athletes and fans through sports focused meta shops & e-commerce</p>
                        </div>

                    </div>
                </div>
                <div className="col-lg-4">
                    <div style={{
                        backgroundImage: "url('/images/bg/vision.png')", height: "188px", backgroundSize: "contain", display: "flex", marginTop:
                            "25px"
                    }}>
                        <div style={{ margin: "10% 10% 10% 15%", padding: "0 5% 0 10%", display: "flex", alignItems: "center", justifyItems: "center" }}>
                            <p style={{ color: "#fff" }}><b style={{ color: "#e90a63", display: "contents" }}>Sports fans</b> generate content, own and monetize with athletes and brands using AI</p>
                        </div>

                    </div>
                </div>
            </div>
            <div className="text-left m-5" style={{ marginLeft: "10% !important", marginTop: "45px !important" }}>
                <p style={{ color: "#fff" }}><b style={{ color: "#e90a63" }}>Mission:</b>  Expanding the Web3 Community by Onboarding Web2 sports fanatics and Gamers into the Sports Digital Twins using AI</p>
            </div>
        </div>
    </div>
);

AboutVisionMission.propTypes = {
    space: PropTypes.oneOf([1, 2]),
    className: PropTypes.string,
    data: PropTypes.shape({
        section_title: SectionTitleType,
        image: ImageType,
        items: PropTypes.arrayOf(ItemType)
    })
};

AboutVisionMission.defaultProps = {
    space: 1
};

export default AboutVisionMission;
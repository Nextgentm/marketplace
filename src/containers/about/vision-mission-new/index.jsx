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
            <div className="text-left" >
                <div className="h--100">
                    <h2 className="vision-mission">MISSION</h2>
                </div>
                <p style={{ color: "#fff" }}>At LootMogul, our mission is to revolutionize the sports industry by empowering athletes, teams, and brands to captivate and connect with fans through innovative AI-driven marketing, immersive gaming experiences, and seamless E-commerce solutions.
                </p>
            </div>
            <div className="text-left" style={{ marginTop: "20px", marginBottom: "20px" }}>
                <div className="h--100">
                    <h2 className="vision-mission">VISION</h2>
                </div>
                <p style={{ color: "#fff" }}>Our vision is to become the leading AI-powered platform for sports engagement, harnessing the power of AI with real-time content and dynamic fan interactions to redefine how sports communities connect and thrive.
                </p>
            </div>
            <div className="row g-5 vision-mision-grid">
                <div className="col-12 col-lg-6">
                    <div className="boxStyle">
                        <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/31045020/Glyph.png`} alt="icon" />
                        <div>
                            <h2 style={{ color: "#fff", marginLeft: "15px" }} className="vision-mission">BRANDS</h2>
                            <p style={{ color: "#fff", marginBottom: "15px", marginLeft: "15px" }} > Brands engage with athletes and fans through a unique blend of AI with marketing, gaming, and e-commerce capabilities on our platform, providing a holistic approach to fan engagement and monetization.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="boxStyle">
                        <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/31045018/Group-8874.png`} alt="icon" />
                        <div>
                            <h2 style={{ color: "#fff", marginLeft: "15px" }} className="vision-mission">TEAMS</h2>
                            <p style={{ color: "#fff", marginBottom: "15px", marginLeft: "15px" }} > Teams and leagues require innovative ways to connect with fans, leveraging our platform to create dynamic and engaging experiences, enhance loyalty programs, and boost fan participation through exclusive content.</p>
                        </div>

                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="boxStyle">
                        <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/31045022/Group-8872.png`} alt="icon" />
                        <div>
                            <h2 style={{ color: "#fff", marginLeft: "15px" }} className="vision-mission">ATHLETES</h2>
                            <p style={{ color: "#fff", marginBottom: "15px", marginLeft: "15px" }} > Athletes engage with brands & fans using personalized and interactive experiences delivered by advanced AI technology, ensuring meaningful and impactful connections. </p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="boxStyle">
                        <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/31045016/Group-8867.png`} alt="icon" />
                        <div>
                            <h2 style={{ color: "#fff", marginLeft: "15px" }} className="vision-mission">SPORTS FANS</h2>
                            <p style={{ color: "#fff", marginBottom: "15px", marginLeft: "15px" }} > Sports fans generate content, own, and monetize with athletes and brands using advanced AI games and personalized merchandise interactions, fostering a dynamic and engaged sports community.
                            </p>
                        </div>

                    </div>
                </div>
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
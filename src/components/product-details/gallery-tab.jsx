import PropTypes from "prop-types";
import Image from "next/image";
import TabContent from "react-bootstrap/TabContent";
import TabContainer from "react-bootstrap/TabContainer";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import { ImageType } from "@utils/types";

const GalleryTab = ({ images }) => (
    <div className="product-tab-wrapper">
        <TabContainer defaultActiveKey="nav-0">
            <div className="pd-tab-inner">
                <Nav className="rn-pd-nav rn-pd-rt-content nav-pills">
                    {images.data && (
                        <Nav.Link
                            key={
                                images.data.url ||
                                "/images/portfolio/lg/portfolio-01.jpg"
                            }
                            as="button"
                            eventKey={`nav-${images.data.id}`}
                        >
                            <span className="rn-pd-sm-thumbnail">
                                <Image
                                    src={
                                        images.data.url ||
                                        "/images/portfolio/lg/portfolio-01.jpg"
                                    }
                                    alt={
                                        images.data.alternativeText || "Product"
                                    }
                                    width={167}
                                    height={167}
                                />
                            </span>
                        </Nav.Link>
                    )}
                </Nav>
                <TabContent className="rn-pd-content">
                    {images.data && (
                        <TabPane
                            key={images.data.url}
                            eventKey={`nav-${images.data.id}`}
                            active="true"
                        >
                            <div className="rn-pd-thumbnail">
                                <Image
                                    src={
                                        images.data.url ||
                                        "/images/portfolio/lg/portfolio-01.jpg"
                                    }
                                    alt={
                                        images.data.alternativeText || "Product"
                                    }
                                    width={560}
                                    height={560}
                                    priority
                                />
                            </div>
                        </TabPane>
                    )}
                </TabContent>
            </div>
        </TabContainer>
    </div>
);

GalleryTab.propTypes = {
    images: PropTypes.arrayOf(ImageType),
};
export default GalleryTab;

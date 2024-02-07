import PropTypes from "prop-types";
import Image from "next/image";
import TabContent from "react-bootstrap/TabContent";
import TabContainer from "react-bootstrap/TabContainer";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import { ImageType } from "@utils/types";
import { useState } from "react";
import { isImgLink } from "@utils/methods";

const GalleryTab = ({ images }) => {

  const [selectedImageNav, setSelectedImageNav] = useState(images.length > 0 ? `nav-${images[0].data.id}` : "");

  return (
    <div className="product-tab-wrapper">
      <TabContainer defaultActiveKey="nav-0">
        <div className="pd-tab-inner">
          <Nav className="rn-pd-nav rn-pd-rt-content nav-pills" style={{ justifyContent: "flex-start" }}>
            {images.length > 0 && images.map((image) =>
              image &&
              <Nav.Link
                key={image.data.url || "/images/portfolio/lg/portfolio-01.jpg"}
                as="button"
                eventKey={`nav-${image.data.id}`}
                onClick={() => setSelectedImageNav(`nav-${image.data.id}`)}
              >
                <span className="rn-pd-sm-thumbnail">
                  {isImgLink(image.data.url) ?
                    <Image
                      src={image.data.url || "/images/portfolio/lg/portfolio-01.jpg"}
                      alt={image.data.alternativeText || "Product"}
                      width={167}
                      height={167}
                    /> :
                    <video width={167} height={167}>
                      <source src={image.data.url} />
                    </video>
                  }
                </span>
              </Nav.Link>
            )}
          </Nav>
          <TabContent className="rn-pd-content">
            {images.length > 0 && images.map((image) =>
              image &&
              <TabPane key={image.data.url} eventKey={`nav-${image.data.id}`} active={selectedImageNav == `nav-${image.data.id}`}>
                <div className="rn-pd-thumbnail">
                  {isImgLink(image.data.url) ?
                    <Image
                      src={image.data.url || "/images/portfolio/lg/portfolio-01.jpg"}
                      alt={image.data.alternativeText || "Product"}
                      width={560}
                      height={560}
                      priority
                    /> :
                    <video controls autoPlay loop width={560} height={560}>
                      <source src={image.data.url} />
                    </video>
                  }
                </div>
              </TabPane>
            )}
          </TabContent>
        </div>
      </TabContainer>
    </div>
  )
};

GalleryTab.propTypes = {
  // images: ImageType
  images: PropTypes.arrayOf(ImageType)
};
export default GalleryTab;

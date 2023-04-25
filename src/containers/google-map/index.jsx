import PropTypes from "prop-types";
import clsx from "clsx";

const GoogleMapArea = ({ space, className }) => (
  <div className={clsx("rn-contact-map-area position-relative", space === 1 && "rn-section-gapTop", className)}>
    <div className="container">
      <div className="row g-5">
        <div className="col-12" data-sal="slide-up" data-sal-delay="150" data-sal-duration="800">
          <div className="connect-thumbnail">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3067.75492592091!2d-75.55371672354178!3d39.745155596239144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6fd6a9dfc32a9%3A0x32b935455e2856b!2s831%20N%20Tatnall%20St%20m%20275%2C%20Wilmington%2C%20DE%2019801%2C%20USA!5e0!3m2!1sen!2sin!4v1681738827885!5m2!1sen!2sin"
              height="550"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

GoogleMapArea.propTypes = {
  space: PropTypes.oneOf([1, 2]),
  className: PropTypes.string
};

GoogleMapArea.defaultProps = {
  space: 1
};

export default GoogleMapArea;

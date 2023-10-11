import PropTypes from "prop-types";
import clsx from "clsx";
import AddressBox from "@components/address-box";

const ContactTopArea = ({ space, className }) => (
  <div className={clsx("rn-contact-top-area bg_color--5", space === 1 && "rn-section-gapTop", className)}>
    <div className="container">
      {/* <div className="row g-5">
        <div className="col-lg-12" data-sal="slide-up" data-sal-delay="150" data-sal-duration="800">
          <div className="section-title mb--30 text-center">
            <h2 className="title">Quick Contact Address</h2>
            <p className="description">
              There are many variations of passages of Lorem Ipsum available, <br /> but the majority have suffered
              alteration.
            </p>
          </div>
        </div>
      </div> */}
      <div className="row g-5">
        <div
          className="col-lg-12 col-md-12 col-sm-12 col-12"
          data-sal="slide-up"
          data-sal-delay="200"
          data-sal-duration="800"
        >
          <AddressBox
            icon="feather-mail"
            title="Our Email Address"
            emails={["support@lootmogul.com", "info@lootmogul.com"]}
          />
        </div>
      </div>
    </div>
  </div>
);

ContactTopArea.propTypes = {
  space: PropTypes.oneOf([1, 2]),
  className: PropTypes.string
};

ContactTopArea.defaultProps = {
  space: 1
};

export default ContactTopArea;

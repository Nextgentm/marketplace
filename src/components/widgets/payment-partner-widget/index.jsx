import PropTypes from "prop-types";
import Image from "next/image";

const PaymentPartnerWidget = ({ data }) => (
  <div className="footer-widget widget-quicklink">
    <h6 className="widget-title">{data.title}</h6>
    {data?.logo && (
      <ul className="footer-list-one">
        {data.logo.map((nav) => (
          <li key={nav.id} className="single-list" style={{ display: "contents" }}>
            <Image src={nav.src} alt={nav.alt || "payment-logo"} height={100} width='100' priority style={{ height: "30px", width: "auto", paddingRight: "20px" }} />
          </li>
        ))}
      </ul>
    )}
  </div>
);

PaymentPartnerWidget.propTypes = {
  data: PropTypes.shape({
    logo: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string
      })
    ),
    text: PropTypes.string
  })
};

export default PaymentPartnerWidget;

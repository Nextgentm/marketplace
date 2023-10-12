import PropTypes from "prop-types";
import Image from "next/image";

const PaymentPartnerWidget = ({ data }) => (
  <div className="footer-widget widget-quicklink">
    <h6 className="widget-title">{data.title}</h6>
    {data?.logo && (
      <ul className="footer-list-one">
        {data.logo.map((nav) => (
          <li key={nav.id} className="single-list">
            <Image src={nav.src} alt={nav.alt || "payment-logo"} width={100} height={60} priority />
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

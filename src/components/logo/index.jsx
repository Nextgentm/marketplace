import Image from "next/image";
import Anchor from "@ui/anchor";
import PropTypes from "prop-types";
import clsx from "clsx";

const Logo = ({ className, logo }) => (
  <div className={clsx("logo-thumbnail logo-custom-css", className)}>
    {logo?.[0]?.src && (
      <Anchor className="logo-light" path="https://metaverse.lootmogul.com/" target="_self">
        <Image src={logo[0].src} alt={logo[0]?.alt || "nft-logo"} width={250} height={60} priority />
      </Anchor>
    )}
    {logo?.[1]?.src && (
      <Anchor className="logo-dark" path="https://metaverse.lootmogul.com/" target="_self">
        <Image src={logo[1].src} alt={logo[1]?.alt || "nft-logo"} width={250} height={60} priority />
      </Anchor>
    )}
  </div>
);

Logo.propTypes = {
  className: PropTypes.string,
  logo: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string
    })
  )
};

export default Logo;

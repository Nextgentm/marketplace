import PropTypes from "prop-types";
import clsx from "clsx";
import Image from "next/image";
import LogoWidget from "@widgets/logo-widget";
import NewsletterWidget from "@widgets/newsletter-widget";
import QuicklinkWidget from "@widgets/quicklink-widget";
import InformationWidget from "@widgets/information-widget";
import SoldOutWidget from "@widgets/sold-out-widget";
import FooterLinkWidget from "@widgets/footer-link-widget";
import SocialWidget from "@widgets/social-widget";
import { ItemType } from "@utils/types";
import Anchor from "@ui/anchor";

// Demo data
import footerData from "../../../data/general/footer-01.json";
import contactData from "../../../data/general/contact.json";
import PaymentPartnerWidget from "@components/widgets/payment-partner-widget";

const Footer = ({ space, className, data }) => (
  <>
    <div
      className={clsx(
        "rn-footer-one bg-color--1",
        space === 1 && "rn-section-gap mt--100 mt_md--80 mt_sm--80",
        space === 2 && "rn-section-gap",
        space === 3 && "mt--100 mt_md--80 mt_sm--80",
        className
      )}
      style={{ paddingBottom: "15px", backgroundColor: "#0f092d" }}
    >
      {data?.items && (
        <div className="footer-top">
          <div className="container">
            <div className="row">
              <ul className="nu-brand-area">
                {data.items.map(({ id, image }) => (
                  <li key={id}>
                    {image?.src && (
                      <Image
                        src={image.src}
                        alt={image?.alt || "nuron-brand_nft"}
                        sizes="200px"
                        fill
                        style={{
                          objectFit: "contain"
                        }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="row gx-5">
          <div className="col-lg-3 col-md-6 col-sm-6 col-12">
            <div className="widget-content-wrapper">
              <NewsletterWidget data={footerData["newsletter-widget"]} />
              <LogoWidget data={footerData["logo-widget"]} />
              <Anchor className="logo-dark" path="https://w.tracxn.com/awards/emerging-awards/pc-console-gaming" target="_blank">
                <Image className="pt--20 pb--40" src={footerData["traCXN-logo"]["logo"][0].src} alt={footerData["traCXN-logo"]["logo"][0]?.alt || "nft-logo"} width={300} height={80} priority />
              </Anchor>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-6 col-12 mt_md--40 mt_sm--40">
            <InformationWidget data={footerData["information-widget"]} />
          </div>

          <div className="col-lg-4 col-md-6 col-sm-6 col-12 mt_mobile--40">
            <QuicklinkWidget data={footerData["quicklink-widget"]} />
            <PaymentPartnerWidget data={footerData["payment-partners"]} />
          </div>

          <div className="col-lg-2 col-md-6 col-sm-6 col-12 mt_md--40 mt_sm--40">
            {/*<div className="widget-bottom">
              <h6 className="title">Try our App</h6>
              <img
                className="w-70 h-auto"
                src="/images/app.png"
                alt=""
              />

                      </div>*/}
          </div>

          {/* <div className="col-lg-3 col-md-6 col-sm-6 col-12 mt_md--40 mt_sm--40">
            <SoldOutWidget data={footerData["soldout-widget"]} />
          </div> */}
        </div>
      </div>
      <div className="row copy-right-one row padding-tb-50 align-items-center d-flex">
        <SocialWidget />
      </div>
    </div>
    {/* Footer text */}
    <div className="copy-right-one ptb--20 bg-color--1" style={{ backgroundColor: "#0f092d" }}>
      <div className="container" style={{ width: "80%", margin: "auto", display: "flex", justifyContent: "center" }}>
          <div className="row w-100 text-center">
              <div className="col-lg-6 d-flex flex-column align-items-center">
            <img
              className="w-100 h-auto w-small"
            src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/03/11013049/Wide-Logo-1-1.png`}
              alt=""
              style={{ padding: "5px", maxWidth: "300px" }}
            />
            <p style={{ color: "#fff" }} className="variant-footerText font-weight-400 font-size-12 text-center">
              LootMogul venture is accelerated (1 of 5 ventures) by National Basketball Player Association in collaboration with Andreessen Horowitz (a16z)’s Cultural Leadership Fund and Patricof Co
            </p>
          </div>

          <div className="col-lg-6 d-flex flex-column align-items-center">
            <img
              className="w-100 h-auto w-small"
              src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/03/11013050/NFLPA-Logo-1.png`}
              alt=""
              style={{ padding: "10px", maxWidth: "300px" }}
            />
            <p style={{ color: "#fff" }} className="variant-footerText font-weight-400 font-size-12 text-center">
              LootMogul is competitively selected (1 of 6 ventures) by National Football League Player Association (NFLPA) to participate in their 2023 NFLPA Pitch Day Competition during the 2023 NFL Superbowl LVII Week.
            </p>
          </div>
        </div>
      </div>
      <div className="container" style={{ width: "95%", margin: "auto", paddingTop: "5px", paddingBottom: "25px" }}>
        <div className="row">
          <div className="col-12">
            <p style={{ color: "#fff" }} className="py-4 px-4 variant-footerText font-weight-500 font-size-10 text-center">
              LootMogul is NOT AFFILIATED, AUTHORIZED, LICENSED OR ENDORSED by NBA (National Basketball Association), NFL
              (National Football League), MLB (Major League Baseball), NHL (National Hockey League), MLS (Major League
              Soccer), NCAA (National College Athletic Association) or any other professional and amateur organization.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <p style={{ color: "#fff" }} className="pb-0 px-4 variant-footerText font-weight-400 font-size-10 text-center">
              © {(new Date()).getFullYear()} LootMogul. All Rights Reserved. NextGenTM, Inc. 831 N Tatnall Street Suite M #275 Wilmington, DE 19801 United States
              {/* <br />Office Address : C/105 Varsha Swapna Gawan Pada, Mulund East, Mumbai - 400081 */}
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
);

Footer.propTypes = {
  space: PropTypes.oneOf([1, 2, 3]),
  className: PropTypes.string,
  data: PropTypes.shape({
    items: PropTypes.arrayOf(ItemType)
  })
};

Footer.defaultProps = {
  space: 1
};

export default Footer;

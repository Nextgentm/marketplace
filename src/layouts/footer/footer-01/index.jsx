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
      style={{ paddingBottom: "15px" }}
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
          <div className="col-lg-4 col-md-6 col-sm-6 col-12">
            <div className="widget-content-wrapper">
              <LogoWidget data={footerData["logo-widget"]} />
              <NewsletterWidget data={footerData["newsletter-widget"]} />
            </div>
          </div>

          <div className="col-lg-4 col-md-6 col-sm-6 col-12 mt_mobile--40">
            <QuicklinkWidget data={footerData["quicklink-widget"]} />
            <PaymentPartnerWidget data={footerData["payment-partners"]} />
          </div>

          <div className="col-lg-4 col-md-6 col-sm-6 col-12 mt_md--40 mt_sm--40">
            <InformationWidget data={footerData["information-widget"]} />
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
    <div className="copy-right-one ptb--20 bg-color--1">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <p className="pr-lg-4 variant-footerText font-weight-400 font-size-18 text-left">
              LootMogul venture is accelerated (1 of 5 ventures) by National Basketball Player Association in collaboration with{" "}
              <a href="#" style={{ color: "#e90a63" }}>
                Andreessen Horowitz (a16z)’s Cultural Leadership Fund and Patricof Co
              </a>
              .
            </p>
          </div>
          <div className="col-lg-4">
            <img
              className="w-100 h-auto"
              src="https://lootmogul-wp-cdn-buckets.s3.us-west-2.amazonaws.com/wp-content/uploads/2022/07/22051935/NBPA.jpg"
              alt=""
            />
            <img
              className="w-100 h-auto mt-2"
              src="https://lootmogul-wp-cdn-buckets.s3.us-west-2.amazonaws.com/wp-content/uploads/2022/07/22052008/Andreessen-Horowitz-1.png"
              alt=""
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <p className="pt-4 pr-4 variant-footerText font-weight-400 font-size-18 text-left">
              Web3 Studios reports LootMogul as one of the top sports metaverse experience platforms
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8">
            <p className="pr-lg-4 variant-footerText font-weight-400 font-size-18 text-left">
              LootMogul is competitively selected (1 of 6 ventures) by National Football League Player Association (NFLPA) to
              participate in their
              <a href="#" style={{ color: "#e90a63" }}>
                2023 NFLPA Pitch Day
              </a>
              Competition during the 2023 NFL Superbowl LVII Week.
            </p>
          </div>
          <div className="col-lg-4">
            <img
              className="w-100 h-auto"
              src="https://lootmogul-wp-cdn-buckets.s3.us-west-2.amazonaws.com/wp-content/uploads/2022/07/22051955/NFLPA-1.png"
              alt=""
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <p className="py-4 px-4 variant-footerText font-weight-500 font-size-18 text-center">
              LootMogul is NOT AFFILIATED, AUTHORIZED, LICENSED OR ENDORSED by NBA (National Basketball Association), NFL
              (National Football League), MLB (Major League Baseball), NHL (National Hockey League), MLS (Major League
              Soccer), NCAA (National College Athletic Association) or any other professional and amateur organization.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <p className="pb-0 px-4 variant-footerText font-weight-400 font-size-18 text-center">
              © 2023 LootMogul. All Rights Reserved. NextGenTM, Inc. 831 N Tatnall Street Suite M #275 Wilmington, DE
              19801 United States
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

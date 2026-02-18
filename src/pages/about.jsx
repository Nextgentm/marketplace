import PropTypes from "prop-types";
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import AboutArea from "@containers/about/layout-02";
import QuoteArea from "@containers/quote-area";
import FunfactArea from "@containers/funfact";
import CTAArea from "@containers/cta";
import SectionTitle from "@components/section-title/layout-02";
import AboutVisionMission from "@containers/about/vision-mission-new";
import { normalizedData } from "@utils/methods";
import { getAllPosts } from "../lib/api";
import Anchor from "@ui/anchor";
// Demo data
import aboutData from "../data/innerpages/about.json";

const About = ({ posts }) => {
  const content = normalizedData(aboutData?.content || []);
  return (
    <Wrapper>
      <SEO pageTitle="About" />
      <Header />
      <main id="main-content">

        <div className="container">
          <div class="rn-support-area rn-section-gapTop">
            <div class="container">
              <div class="row g-6">
                <div className="col-lg-12">
                  <div className="rn-about-title-wrapper pt-5">
                    <h1>About Us</h1>
                  </div>
                </div>
                <div class="col-lg-12">
                  <div class="rn-support-read">
                    <div class="read-card">
                      <div class="content">
                        <p style={{ color: "#fff", marginBottom: "15px" }}> Welcome to LootMogul, where innovation meets the sports world. We are a cutting-edge AI-powered sports technology platform that revolutionizes the way real-world products and assets are transformed into dynamic digital counterparts. Utilizing the latest advancements in AI and blockchain technology, we are redefining fan engagement and optimizing experiences for all stakeholders in the sports industry.
                        </p>
                        <div className="boxStyle">
                          <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/17021423/Transforming-the-Sports-Experience-pink-1.png`} alt="icon" />
                          <p style={{ color: "#fff", marginBottom: "15px" }} ><b style={{ color: "#e90a63;" }}>Transforming the Sports Experience: </b>At LootMogul, we’re not just reimagining the sports world, we’re rebuilding it. Our platform, designed for sports influencers and agencies who bring their loyal fans and brand partners, leverages advanced AI to identify trends, design content gaps, and engage fans with real-time offers and e-commerce merchandise. This ecosystem is a dynamic playground for all sports stakeholders.
                          </p>
                        </div>
                        <div className="boxStyle">
                          <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/17021421/Innovative-Fan-Engagement-pink.png`} alt="icon" />
                          <p style={{ color: "#fff", marginBottom: "15px" }}>
                            <b style={{ color: "#e90a63;" }}>Innovative Fan Engagement: </b>We’ve introduced groundbreaking touchpoints to revolutionize fan experiences both in and out of sports venues. From creating snackable videos, faceless content, and automated highlights to offering avatars, trivia, polls, quizzes, and virtual meet-and-greets with athletes, LootMogul sets new standards for fan engagement. Our S.M.A.R.T. arenas and innovative fan engagement strategies transform traditional stadiums into hubs of interaction.
                          </p>
                        </div>
                        <div className="boxStyle">
                          <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/17021418/Driving-the-Digital-Sports-Economy-pink.png`} alt="icon" />
                          <p style={{ color: "#fff", marginBottom: "15px" }}>
                            <b style={{ color: "#e90a63;" }}>Driving the Digital Sports Economy: </b>Our Monetization-First strategy for brands and athletes, coupled with a user-friendly approach to blockchain and AI, offers a sustainable revenue model while enhancing engagement. High ROI for brands and agencies through engaging, personalized fan experiences, influencer marketing, and revenue share incentives with athletes, teams, and leagues makes LootMogul the ultimate destination for sports stakeholders.
                          </p>
                        </div>
                        <div className="boxStyle">
                          <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/17021417/A-New-Era-for-Sports-Merchandise-white-pink.png`} alt="icon" />
                          <p style={{ color: "#fff", marginBottom: "15px" }}>
                            <b style={{ color: "#e90a63;" }}>A New Era for Sports Merchandise: </b>Our mission extends to digitizing every aspect of the sports world, from stadiums and players to sports bars and memorabilia. This dual-world approach opens new monetization and engagement avenues for brands, teams, and stadium owners, enabling fans to experience and shop in both digital and physical realms.
                          </p>
                        </div>
                        <div className="boxStyle">
                          <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/17021415/Empowering-the-Community-with-MogulX.ai-pink.png`} alt="icon" />
                          <p style={{ color: "#fff", marginBottom: "15px" }}>
                            <b style={{ color: "#e90a63;" }}>Empowering the Community with AI advancements:</b> Our platform revolutionizes marketing with AI-driven interactive imagery, personalized avatars, and custom merchandise. We elevate brand engagement through cutting-edge video campaigns, creating a vibrant and collaborative ecosystem for innovation.
                          </p>
                        </div>
                        <div className="boxStyle">
                          <img src={`${process.env.NEXT_PUBLIC_WP_UPLOAD_DIR}/2024/07/17021412/Our-Growth-and-Industry-Recognition-pink.png`} alt="icon" />
                          <p style={{ color: "#fff", marginBottom: "15px" }}>
                            <b style={{ color: "#e90a63;" }}>Our Growth and Industry Recognition: </b>Since our inception in 2020, LootMogul has rapidly expanded, attracting 367 professional athletes and numerous sports teams, achieving over 2 million monthly visits, and facilitating more than 1 million games played. Our groundbreaking work has not only placed us among the top unicorns in AI, Gaming and Web3 but has also earned us accolades and recognition from prestigious sports associations such as NBA and NFL Player Associations, reinforcing our position as a leader in the sports gaming and marketing technology.
                          </p>
                        </div>

                        <p style={{ color: "#fff", marginBottom: "15px" }}>
                          Join us at LootMogul as we continue to push the boundaries of sports technology, creating a world where every game played and every fan interaction opens a portal to new possibilities. Whether you’re looking to engage with sports in a way never before possible, develop the next big game in the digital space, or invest in the future of sports technology, LootMogul is where your journey begins.
                        </p>

                      </div>
                    </div>

                    <div class="read-card">
                      <div class="content">
                        <p style={{ color: "#fff", marginBottom: "15px" }}>Stay connected:</p>
                        <ul>
                          <li style={{ fontSize: "18px", color: "#fff" }}>Corporate news – <Anchor style={{ color: "#e90a63" }} target="_blank" path="https://www.linkedin.com/company/lootmogul">
                            https://www.linkedin.com/company/lootmogul
                          </Anchor></li>
                          <li style={{ fontSize: "18px", color: "#fff" }}>Community – <Anchor style={{ color: "#e90a63" }} target="_blank" path="https://www.instagram.com/lootmogul">
                            https://www.instagram.com/lootmogul
                          </Anchor></li>
                          {/* <li style={{ fontSize: "18px", color: "#fff" }}>Press Releases – <Anchor style={{ color: "#e90a63" }} target="_blank" path="https://metaverse.lootmogul.com/press-releases">
                            https://metaverse.lootmogul.com/press-releases
                          </Anchor></li> */}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AboutVisionMission />
        </div>
        {/* <AboutArea data={content["about-section"]} /> */}
        {/* <QuoteArea data={content["quote-section"]} /> */}
        {/* <FunfactArea data={content["funfact-section"]} /> */}
        {/* <CTAArea data={content["cta-section"]} /> */}
      </main>
      <Footer />
    </Wrapper >
  );
};

export async function getStaticProps() {
  const posts = getAllPosts(["title", "date", "slug", "image", "category", "timeToRead"]);

  return {
    props: {
      posts: posts.slice(0, 4),
      className: "template-color-1"
    }
  };
}

About.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({}))
};

export default About;
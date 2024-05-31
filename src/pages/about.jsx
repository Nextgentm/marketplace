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
import AboutVisionMission from "@containers/about/vision-mission";
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
                        <p style={{ color: "#fff", marginBottom: "15px" }}> Welcome to LootMogul, where the thrill of sports meets the forefront of digital innovation. Our platform is a beacon for sports enthusiasts, gamers, brands, investors, and sports game developers seeking to dive into an athlete-led sports technology universe, powered by the most advanced blockchain and artificial intelligence technologies.
                        </p>
                        <p style={{ color: "#fff", marginBottom: "15px" }}><b style={{ color: "#e90a63;" }}>Transforming the Sports Experience: </b>At LootMogul, we are not just reimagining the sports world; we are rebuilding it. As the official metaverse and gaming partner for Cricket South Africa and the Durban Super Giants, we are erasing the lines between the physical and the digital world. From creating virtual twins of stadiums to launching blockchain-based mini-games and advanced AI-driven ecommerce storefronts, our ecosystem is a dynamic playground for all sports stakeholders.
                        </p>
                        <p style={{ color: "#fff", marginBottom: "15px" }}>
                          <b style={{ color: "#e90a63;" }}>Innovative Fan Engagement: </b>We have introduced groundbreaking touchpoints to revolutionize fan experiences both in and out of sports venues. By transforming traditional stadiums into S.M.A.R.T. arenas, publishing sports games in engaging, bite-sized formats, and blending the physical with the digital for sports memorabilia, LootMogul is setting new standards for in-stadium and digital fan engagement.
                        </p>
                        <p style={{ color: "#fff", marginBottom: "15px" }}>
                          <b style={{ color: "#e90a63;" }}>Driving the Digital Sports Economy: </b>Our Monetization-First strategy for brands and athletes, coupled with a user-friendly approach to blockchain and AI, offers a sustainable revenue model while enhancing engagement. Whether you are a brand looking to tap into a vibrant sports community, an athlete seeking to connect with fans, or a fan eager for unparalleled access to sports action and merchandise, LootMogul is your ultimate destination.
                        </p>
                        <p style={{ color: "#fff", marginBottom: "15px" }}>
                          <b style={{ color: "#e90a63;" }}>A New Era for Sports Merchandise: </b>Our mission extends to digitizing every aspect of the sports world, from stadiums and players to sports bars and memorabilia, creating a multifaceted universe where fans can experience and shop in both digital and physical realms. This dual-world approach opens new monetization and engagement avenues for brands, teams, and stadium owners.
                        </p>
                        <p style={{ color: "#fff", marginBottom: "15px" }}>
                          <b style={{ color: "#e90a63;" }}>Empowering the Community with <a href="https://mogulx.ai/">MogulX.ai</a>:</b> Our dedicated platform, MogulX.ai, fosters collaboration and AI development, allowing the creation of AI avatars that can be trained and compete globally. This initiative underscores our commitment to innovation and community governance, ensuring a fair and dynamic ecosystem for all.
                        </p>
                        <p style={{ color: "#fff", marginBottom: "15px" }}>
                          <b style={{ color: "#e90a63;" }}>Our Growth and Industry Recognition: </b>Since our inception in 2020, LootMogul has rapidly expanded, attracting 367 professional athletes and numerous sports teams, achieving over 2 million monthly visits, and facilitating more than 1 million games played. Our groundbreaking work has not only placed us among the top unicorns in Gaming, Web3, and Consumer Marketplaces but has also earned us accolades and recognition from prestigious sports associations such as NBA and NFL Player Associations, reinforcing our position as a leader in the sports digital twin technology.
                        </p>
                        <p style={{ color: "#fff", marginBottom: "15px" }}>
                          Join us at LootMogul as we continue to push the boundaries of sports technology, creating a world where every game played, and every fan interaction opens a portal to new possibilities. Whether you are looking to engage with sports in a way never before possible, develop the next big game in the digital space, or invest in the future of sports technology, LootMogul is where your journey begins.

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
                          <li style={{ fontSize: "18px", color: "#fff" }}>Press Releases – <Anchor style={{ color: "#e90a63" }} target="_blank" path="https://metaverse.lootmogul.com/press-releases">
                            https://metaverse.lootmogul.com/press-releases
                          </Anchor></li>
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
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
import { normalizedData } from "@utils/methods";
import { getAllPosts } from "../lib/api";

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
          <div className="row g-5 d-flex align-items-center">
            <div className="col-lg-12">
              <div className="rn-about-title-wrapper">
                <SectionTitle title={"ABOUT US"} />
              </div>
            </div>

            <div class="elementor-widget-container">
              <p><b>LootMogul&nbsp;</b> is an athlete-led sports technology platform that is powered by regenerative AI, multi-player blockchain mini-games, e-commerce shops for brands and athletes, virtual real estates, training academies, and digital collectibles with In-Real-Life (IRL) rewards (e.g., Live Events, Merchandize, Players etc).</p><p>We are a fast-growing sports web3 gaming and e-commerce platform where athletes own land, studios, stadiums, and experience hubs to generate lifetime royalties by engaging with fans through Learn &amp; Earn and Play &amp; Earn models. The fans get to engage with their idols to learn new skill sets, earn rewards and gain access to real-world VIP events &amp; limited-edition physical and digital merchandizes.</p><p>The company was launched in 2020 by veteran gaming and technology executives, <a href="https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Flinkedin.com%2Fin%2Frajkotia&amp;data=05%7C01%7Carne%40fjlabs.com%7C3454810f94d04b60976308daf5a24aa2%7C4ca8a3498b2a465c917ec5e8a27c38c4%7C0%7C0%7C638092374669354492%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&amp;sdata=%2FIuj80ivUhNioWURkUA7anWD7yPqv5GcVwNk%2BL1DZ2I%3D&amp;reserved=0" target="_blank" rel="noopener">Raj Rajkotia</a> and <a href="https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fkuntalsampat%2F&amp;data=05%7C01%7Carne%40fjlabs.com%7C3454810f94d04b60976308daf5a24aa2%7C4ca8a3498b2a465c917ec5e8a27c38c4%7C0%7C0%7C638092374669354492%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&amp;sdata=duc41k3091O9iJ7j4qJZ%2FlJVlOF%2BXa5%2B1pkkFXw6lpQ%3D&amp;reserved=0" target="_blank" rel="noopener">Kuntal Sampat</a>. Since the launch of its multi-chain product release, LootMogul has had exponential growth both in terms of users, brand engagement, and meta-world cities (blockchain assets and digital collectibles).</p><p>With Goldman Sachs &amp; McKinsey expecting Metaverse commerce and gaming to reach <a href="https://news.bitcoin.com/goldman-sachs-metaverse-8-trillion-opportunity" target="_blank" rel="noopener" data-saferedirecturl="https://www.google.com/url?q=https://news.bitcoin.com/goldman-sachs-metaverse-8-trillion-opportunity&amp;source=gmail&amp;ust=1675333873409000&amp;usg=AOvVaw0r0dThXe6BASj24qz_AKyz">$8+ trillion by 2030</a>, LootMogul is uniquely positioned to capitalize on this opportunity with its fully integrated focus on Sports, Commerce, and True-In-Real-Life (TIRL) rewards for fans, athletes, and brands and was listed as one of the <a href="https://venturebeat.com/games/how-the-landscape-of-sports-will-evolve-in-the-metaverse" target="_blank" rel="noopener" data-saferedirecturl="https://www.google.com/url?q=https://venturebeat.com/games/how-the-landscape-of-sports-will-evolve-in-the-metaverse&amp;source=gmail&amp;ust=1675333873409000&amp;usg=AOvVaw1uVqbf04wy6LBIh59jzlrn">top sports metaverse projects by Venturebeat.com.</a></p><p><a href="https://mogulx.ai/">MogulX.ai</a> is a dedicated community product created by LootMogul to drive collaboration and AI development in the sports tech industry. Athletes, fans, brands and game developers can leverage LootMogul’s open architecture to create their non-player-characters (NPCs), aka AI avatars, that can be trained in both a supervised and unsupervised manner by the creator. These newly trained AI avatars can compete globally across all compatible games, sports and esports tournaments to generate revenue for all stakeholders.</p><p>Community governance for AI will be implemented through LootMogul’s open APIs for all stakeholders to ensure AI’s behavior for both supervised and unsupervised deep learning.</p>						</div>
          </div>

          <div class="elementor-widget-container">
            <p> <strong>Strategy and Approach<br /></strong> </p>
            <ul>
              <li>Monetization-First strategy for brands (SaaS-B2B) and athletes &amp; fans (B2C) drives steady long-term revenue &amp; engagement for all stakeholders.</li>
              <li>Pragmatic and simplistic approach to onboarding the Web2 sports community (athletes, brands, and fans) into the Web3 ecosystem using AI.</li>
            </ul>
          </div>
          <div class="elementor-widget-container">
            <p><strong>Traction<br /></strong></p>
            <p>LootMogul has currently signed up 312 professional athletes from NFL, NBA, WNBA, MLB, UFC, etc., high school and college athletes as well as 16 sports teams under a multi-year contract.<span style={{ fontSize: "18px" }}>&nbsp;The total reach through players is 104M. Additionally, LootMogul is generating significant monthly revenue from 7 live games and Web3 E-Commerce.</span></p>
          </div>
          <div class="elementor-widget-container">
            <p><strong>Industry Recognition</strong></p>
            <p>In 2022, LootMogul was competitively selected (1 of 5 ventures) by National Basketball Player Association (NBPA) in collaboration with Andreessen Horowitz (a16z)’s Cultural Leadership Fund and Patricof Co in their 2022 NBPA Players Accelerator Program.</p>
            <p>In 2023, LootMogul is competitively selected (1 of 6 ventures) by National Football League Player Association (NFLPA) to participate in their 2023 NFLPA Pitch Day Competition.</p>
            <p>In addition, LootMogul is the only Web3 venture selected by both NBA Player Association and NFL Player Association in their accelerator/pitch day program.</p>
          </div>
          <div class="elementor-widget-container">
            <div>
              <p>Stay connected:</p>
              <ul>
                <li>Corporate news – <a href="https://www.linkedin.com/company/lootmogul/" target="_blank" rel="noopener">https://www.linkedin.com/company/lootmogul</a></li>
                <li>Community – <a href="https://www.instagram.com/lootmogul/" target="_blank" rel="noopener">https://www.instagram.com/lootmogul</a></li>
                <li>Press Releases – <a href="https://metaverse.lootmogul.com/press-releases/" target="_blank" rel="noopener">https://metaverse.lootmogul.com/press-releases</a></li>
              </ul>
            </div>
            <div>
              <div dir="ltr" data-smartmail="gmail_signature">
                <div dir="ltr">&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
        {/* <AboutArea data={content["about-section"]} /> */}
        {/* <QuoteArea data={content["quote-section"]} /> */}
        {/* <FunfactArea data={content["funfact-section"]} /> */}
        {/* <CTAArea data={content["cta-section"]} /> */}
      </main>
      <Footer />
    </Wrapper>
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

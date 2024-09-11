import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import UploadVariants from "@containers/upload-variants";
import { useContext, useState } from "react";
import { AppData } from "src/context/app-context";
export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const Home = () => {
  let [isAdmin, setAdmin] = useState(false);
  let { userData } = useContext(AppData);

  return (
    <Wrapper>
      <SEO pageTitle="Upload Variants" />
      <Header setAdmin={setAdmin} />
      <main id="main-content">
        <Breadcrumb pageTitle="Upload Variants" />
        {userData && isAdmin && <UploadVariants pageType="create" />}
      </main>
      <Footer />
    </Wrapper>
  )
}

export default Home;

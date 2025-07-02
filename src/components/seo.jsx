import Head from "next/head";
import PropTypes from "prop-types";

const SEO = ({ pageTitle, slug, description, keywords }) => {
  const title = `${pageTitle} || LootMogul - Digital Collectibles Marketplace`;
  const desc = `${description} || LootMogul - Digital Collectibles Marketplace`;

  const canonicalUrl = slug
    ? `https://marketplace.lootmogul.com/${slug}`
    : "https://marketplace.lootmogul.com";

  return (
    <Head>
      <title>{title}</title>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="description" content={desc} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href={canonicalUrl} />
      {keywords && <meta name="keywords" content={keywords} />}
    </Head>
  );
};

SEO.propTypes = {
  pageTitle: PropTypes.string.isRequired
};

export default SEO;
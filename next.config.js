const path = require("path");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

const defaultConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false
  },
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, "./src/assets/scss")]
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // eslint-disable-next-line no-param-reassign
    config.ignoreWarnings = [
      {
        message: /(magic-sdk|@walletconnect\/web3-provider|@web3auth\/web3auth)/
      }
    ];
    return config;
  },
  images: {
    domains: ["media-content.lootmogul.com", "storage.googleapis.com", "g-media-content.lootmogul.com"]
  },
  compiler: {
    styledComponents: {
      displayName: true,
      "ssr": true
    }
  }
};

module.exports = withBundleAnalyzer(defaultConfig);

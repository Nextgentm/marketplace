/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://marketplace.lootmogul.com",
  generateRobotsTxt: process.env.SITE_URL === "https://marketplace.lootmogul.com" ? true : false
};

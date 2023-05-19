import strapi from "@utils/strapi";

export const getCollection = async (filters = null) => {
  return await strapi.find("collections", filters);
};

export const getCollectible = async (filters = null) => {
  return await strapi.find("collectibles", filters);
};

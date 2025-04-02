import strapi from "@utils/strapi";

const COLLECTION_API = "collections";

export const getCollection = async (filters = null) => {
  const defaultFilters = {
    filters: {
      blockchain: "somnia"
    }
  };

  // Merge any additional filters with the default blockchain filter
  const finalFilters = filters
    ? {
        filters: {
          ...defaultFilters.filters,
          ...(filters.filters || {})
        }
      }
    : defaultFilters;

  return await strapi.find(COLLECTION_API, finalFilters);
};

export const getCollectible = async (filters = null) => {
  const defaultFilters = {
    filters: {
      blockchain: "somnia"
    }
  };

  // Merge any additional filters with the default blockchain filter
  const finalFilters = filters
    ? {
        filters: {
          ...defaultFilters.filters,
          ...(filters.filters || {})
        }
      }
    : defaultFilters;

  return await strapi.find("collectibles", finalFilters);
};

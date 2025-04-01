import strapi from "@utils/strapi";

export const getCollection = async (filters = null) => {
  const defaultFilters = {
    filters: {
      blockchain: 'somnia'
    }
  };
  
  // Merge any additional filters with the default blockchain filter
  const finalFilters = filters ? {
    filters: {
      ...defaultFilters.filters,
      ...(filters.filters || {})
    }
  } : defaultFilters;
  
  return await strapi.find("collections", finalFilters);
};

export const getCollectible = async (filters = null) => {
  const defaultFilters = {
    filters: {
      blockchain: 'somnia'
    }
  };
  
  // Merge any additional filters with the default blockchain filter
  const finalFilters = filters ? {
    filters: {
      ...defaultFilters.filters,
      ...(filters.filters || {})
    }
  } : defaultFilters;
  
  return await strapi.find("collectibles", finalFilters);
};

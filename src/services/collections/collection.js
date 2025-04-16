import strapi from "@utils/strapi";
import { NETWORK_NAMES } from "@utils/constants";

export const getCollection = async (filters = null) => {
  const defaultFilters = {
    filters: {
      blockchain: { $eq: NETWORK_NAMES.NETWORK } // "Not equal to" condition
    }
  };
  console.log(`${process.env.BlOCKCHAIN}`, "second filters");

  // Merge any additional filters with the default blockchain filter
  const finalFilters = filters
    ? {
        ...filters,
        filters: {
          ...defaultFilters.filters,
          ...(filters.filters || {})
        }
      }
    : defaultFilters;
  console.log("final filters:", JSON.stringify(finalFilters));
  let data = await strapi.find("collections", finalFilters);
  console.log("filter data is ::::::: ", data);
  return data;
};

export const getCollectible = async (filters = null) => {
  const defaultFilters = {
    filters: {
      // blockchain: NETWORK_NAMES.NETWORK
      blockchain: { $eq: NETWORK_NAMES.NETWORK } // "Not equal to" condition
    }
  };
  console.log(`${process.env.BlOCKCHAIN}`, "first filters");
  // Merge any additional filters with the default blockchain filter
  const finalFilters = filters
    ? {
        ...filters,
        filters: {
          ...defaultFilters.filters,
          ...(filters.filters || {})
        }
      }
    : defaultFilters;
  console.log("get collector filters:", finalFilters);
  return await strapi.find("collectibles", finalFilters);
};

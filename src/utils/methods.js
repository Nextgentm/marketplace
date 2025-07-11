/* eslint-disable indent */
/* eslint-disable no-confusing-arrow */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
function slideUp(element, duration = 500) {
  return new Promise((resolve, _reject) => {
    element.style.height = `${element.offsetHeight}px`;
    element.style.transitionProperty = `height, margin, padding`;
    element.style.transitionDuration = `${duration}ms`;
    element.offsetHeight;
    element.style.overflow = "hidden";
    element.style.height = 0;
    element.style.paddingTop = 0;
    element.style.paddingBottom = 0;
    element.style.marginTop = 0;
    element.style.marginBottom = 0;
    window.setTimeout(() => {
      element.style.display = "none";
      element.style.removeProperty("height");
      element.style.removeProperty("padding-top");
      element.style.removeProperty("padding-bottom");
      element.style.removeProperty("margin-top");
      element.style.removeProperty("margin-bottom");
      element.style.removeProperty("overflow");
      element.style.removeProperty("transition-duration");
      element.style.removeProperty("transition-property");
      resolve(false);
    }, duration);
  });
}

function slideDown(element, duration = 500) {
  return new Promise((_resolve, _reject) => {
    element.style.removeProperty("display");
    let { display } = window.getComputedStyle(element);

    if (display === "none") display = "block";

    element.style.display = display;
    const height = element.offsetHeight;
    element.style.overflow = "hidden";
    element.style.height = 0;
    element.style.paddingTop = 0;
    element.style.paddingBottom = 0;
    element.style.marginTop = 0;
    element.style.marginBottom = 0;
    element.offsetHeight;
    element.style.transitionProperty = `height, margin, padding`;
    element.style.transitionDuration = `${duration}ms`;
    element.style.height = `${height}px`;
    element.style.removeProperty("padding-top");
    element.style.removeProperty("padding-bottom");
    element.style.removeProperty("margin-top");
    element.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      element.style.removeProperty("height");
      element.style.removeProperty("overflow");
      element.style.removeProperty("transition-duration");
      element.style.removeProperty("transition-property");
    }, duration);
  });
}

function slideToggle(element, duration = 500) {
  if (window.getComputedStyle(element).display === "none") {
    return slideDown(element, duration);
  }
  return slideUp(element, duration);
}

const flatDeep = (arr, d = 1) =>
  d > 0 ? arr?.reduce((acc, val) => acc?.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), []) : arr.slice();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function normalizedData(data, key = "section") {
  let allContetnt;

  data.forEach((item) => {
    const newObj = Object.entries(item).reduce((acc, cur) => {
      const [k, property] = cur;
      if (property === null) {
        return acc;
      }
      return {
        ...acc,
        [k]: property
      };
    }, {});

    allContetnt = {
      ...allContetnt,
      [newObj[key]]: {
        ...newObj
      }
    };
  });

  return allContetnt;
}

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const getMonth = (date) => months[date.getMonth()];

const containsObject = (obj, list) => {
  let i;
  for (i = 0; i < list.length; i++) {
    if (list[i].slug === obj.slug) {
      return i;
    }
  }

  return -1;
};

const shuffleArray = (array) => {
  const newArr = array.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr;
};

const hasKey = (obj, key) => !!Object.prototype.hasOwnProperty.call(obj, key);

const isEmpty = (obj) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
};
const normalize = (data) => {
  const isObject = (data) => Object.prototype.toString.call(data) === "[object Object]";
  const isArray = (data) => Object.prototype.toString.call(data) === "[object Array]";

  const flatten = (data) => {
    if (!data.attributes) return data;

    return {
      ...(data.id ? { id: data.id } : {}),
      ...data.attributes
    };
  };

  if (isArray(data)) {
    return data.map((item) => normalize(item));
  }

  if (isObject(data)) {
    if (isArray(data.data)) {
      data = [...data.data];
    } else if (isObject(data.data)) {
      data = flatten({ ...data.data });
    } else if (data.data === null) {
      data = null;
    } else {
      data = flatten(data);
    }

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in data) {
      data[key] = normalize(data[key]);
    }

    return data;
  }

  return data;
};
const isServer = () => {
  return typeof window === "undefined";
};

const isImgLink = (url) => {
  if (typeof url !== "string") return false;
  return url.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp|webp)(\?(.*))?$/gim) != null;
};

const getTodayDate = (skip = 0) => {
  let date = new Date();
  if (skip > 0) {
    date.setDate(date.getDate() + skip);
  }
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;

  let today = year + "-" + month + "-" + day;
  return today;
};

module.exports = {
  slideUp,
  slideDown,
  slideToggle,
  flatDeep,
  normalizedData,
  slugify,
  getMonth,
  containsObject,
  shuffleArray,
  hasKey,
  isEmpty,
  normalize,
  isServer,
  isImgLink,
  getTodayDate
};

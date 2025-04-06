import client from "@utils/apollo-client";
import { getClientCookie, getCookie, setCookie } from "@utils/cookies";
import { isServer } from "@utils/methods";
import path from "path";
import { GET_LOGIN_USER } from "src/graphql/query/me/getLoginuser";
import { authenticationData } from "src/graphql/reactive/authentication";

const directory = path.join(process.cwd(), "src/data/authors");

function getSlugs(dirPath) {
  return fs.readdirSync(dirPath);
}

export function getUserBySlug(slug, fields) {
  const realSlug = slug.replace(/\.json$/, "");
  const fullPath = path.join(directory, `${realSlug}.json`);
  const fileContents = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  let user;
  if (fields === "all") {
    user = { ...fileContents, slug: realSlug };
  } else {
    user = fields.reduce((acc, field) => {
      if (field === "slug") {
        return { ...acc, [field]: realSlug };
      }
      if (typeof fileContents[field] !== "undefined") {
        return {
          ...acc,
          [field]: fileContents[field]
        };
      }
      return acc;
    }, {});
  }
  return user;
}

export function getAllUsers(fields, skip = 0, limit) {
  const slugs = getSlugs(directory);
  let users = slugs.map((slug) => getUserBySlug(slug, fields));
  if (limit) users = users.slice(skip, limit);
  return users;
}

export function getAuthorByID(id, fields) {
  const users = getAllUsers(fields);
  const user = users.find((item) => item.id === id);
  return user || {};
}

export const getAuthenticatedUser = async (ctx) => {
  console.log("data =-========");
  const { isAuthenticated } = await getLoginToken(ctx);
  console.log("isAuthenticated*-*-*-*-*-", isAuthenticated);
  if (isAuthenticated) {
    let data = await client.query({
      query: GET_LOGIN_USER,
      fetchPolicy: "network-only"
    });
    console.log("data", data);
  } else {
    return {};
  }
};
export const getLoginToken = async (ctx) => {
  if (isServer()) {
    if (ctx && ctx.req && ctx.req.headers && ctx.req.headers.cookie) {
      const token = getCookie("token", ctx.req.headers.cookie);
      const isAuthenticated = token ? true : false;

      return {
        isAuthenticated,
        token
      };
    } else {
      return {
        isAuthenticated: false,
        token: null
      };
    }
  } else {
    const token = (await getClientCookie("token")) || null;
    const isAuthenticated = token ? true : false;

    return {
      isAuthenticated,
      token
    };
  }
};
export const userSessionData = async (ctx) => {
  try {
    if (isServer()) {
      if (ctx?.req?.headers?.cookie) {
        const token = await getCookie("token", ctx.req.headers.cookie);
        return {
          isAuthenticated: !!token,
          token: token || null,
          user: {}
        };
      }
      return {
        isAuthenticated: false,
        token: null,
        user: {}
      };
    } else {
      const token = await getClientCookie("token");
      return {
        isAuthenticated: !!token,
        token: token || null,
        user: {}
      };
    }
  } catch (error) {
    console.error("Error in userSessionData:", error);
    return {
      isAuthenticated: false,
      token: null,
      user: {}
    };
  }
};

export const doLogOut = async () => {
  if (!isServer()) {
    localStorage.clear();
    await setCookie("token", "", { expires: new Date(0) });
  }
};

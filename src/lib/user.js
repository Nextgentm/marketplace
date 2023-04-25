import path from "path";
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

export const userSessionData = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("user") || "";
  const isAuthenticated = localStorage.getItem("user") || "";

  return {
    isAuthenticated,
    token,
    user
  };
};

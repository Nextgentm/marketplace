import cookie from "cookie";

export function setCookie(name, value, options = {}) {
  const serializedValue = typeof value === "object" ? JSON.stringify(value) : String(value);
  const cookieOptions = {
    path: "/",
    sameSite: "strict",
    ...options
  };
  const cookieStr = cookie.serialize(name, serializedValue, cookieOptions);
  document.cookie = cookieStr;
}

export const getCookie = async (cookiename, cookiestring) => {
  let name = cookiename + "=";
  let decodedCookie = decodeURIComponent(cookiestring);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

export const getClientCookie = async (name) => {
  const cookieStr = document.cookie || "";
  const cookies = cookie.parse(cookieStr);
  const serializedValue = cookies[name];
  if (!serializedValue) {
    return null;
  }
  try {
    return JSON.parse(serializedValue);
  } catch (err) {
    return serializedValue;
  }
};

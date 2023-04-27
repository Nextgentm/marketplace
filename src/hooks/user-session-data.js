import { useEffect } from "react";
import { userSessionData } from "src/lib/user";

export const useUserSessionData = () => {
  const [user, setUser] = useState();
  const [token, setToken] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const { isAuthenticated, token, user } = userSessionData();
    setIsAuthenticated(isAuthenticated);
    setToken(token);
    setUser(user);
  }, [localStorage]);
  return user, setUser, token, setToken, isAuthenticated, setIsAuthenticated;
};

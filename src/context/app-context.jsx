import { isServer } from "@utils/methods";
import { useRouter } from "next/router";
import { createContext, useState, useMemo, useEffect } from "react";
import { userSessionData } from "src/lib/user";

export const AppData = createContext(null);

const AppDataContext = ({ children }) => {
  const router = useRouter();
  const [walletData, setWalletData] = useState({
    provider: null,
    account: null,
    balance: null,
    ethers: null,
    isConnected: false
  });
  const [userData, setUserData] = useState();
  const [isAuthenticatedCryptoWallet, setIsAuthenticatedCryptoWallet] = useState(false);

  useEffect(() => {
    (async () => await loadUserData())();
    console.log("*-*-*-*-*-*appcontext");
  }, [router.asPath]);

  const loadUserData = async () => {
    const { isAuthenticated } = await userSessionData();
    console.log("isAuthenticated");
    if (!isServer() && isAuthenticated) {
      const user = JSON.parse(localStorage.getItem("user"));
      setUserData(user);
    } else if (!isAuthenticated) setUserData();
  };
  const value = useMemo(
    () => ({
      walletData,
      setWalletData,
      loadUserData,
      userData,
      isAuthenticatedCryptoWallet,
      setIsAuthenticatedCryptoWallet,
      setUserData
    }),
    [walletData, userData, isAuthenticatedCryptoWallet]
  );
  return <AppData.Provider value={value}>{children}</AppData.Provider>;
};

export default AppDataContext;

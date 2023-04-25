import { createContext, useState, useMemo } from "react";

export const WalletData = createContext(null);

const WalletDataContext = ({ children }) => {
  const [walletData, setWalletData] = useState({
    provider: null,
    account: null,
    balance: null,
    ethers: null,
    isConnected: false
  });

  const value = useMemo(
    () => ({
      walletData,
      setWalletData
    }),
    [walletData]
  );

  return <WalletData.Provider value={value}>{children}</WalletData.Provider>;
};

export default WalletDataContext;

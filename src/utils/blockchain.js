import { NETWORKS } from '../config/networks';

export function walletAddressShortForm(value) {
  return value.substr(0, 5) + "...." + value.substr(-4);
}

export function transactionHashShortForm(value) {
  return value.substr(0, 6) + "...." + value.substr(-4);
}

export const addSomniaNetwork = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [NETWORKS.SOMNIA],
    });
  } catch (error) {
    console.error('Error adding Somnia network:', error);
    throw error;
  }
};

export const switchToSomniaNetwork = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.SOMNIA.chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await addSomniaNetwork();
    } else {
      throw error;
    }
  }
};

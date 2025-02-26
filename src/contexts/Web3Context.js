import { ethers } from 'ethers';
import { createContext, useContext, useEffect, useState } from 'react';
import { getContract } from '../utils/blockchain';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [networkName, setNetworkName] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not installed!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await initWeb3();
    } catch (error) {
      console.error('User rejected connection:', error);
      throw error;
    }
  };

  const initWeb3 = async () => {
    if (!window.ethereum) {
      console.log('Please install MetaMask!');
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const allowedNetworks = {
        '0x5': 'GOERLI',
        '0x13881': 'MUMBAI',
        // Add other networks as needed
      };

      const networkKey = allowedNetworks[chainId];
      if (!networkKey) {
        alert(`Please connect to one of: ${Object.values(allowedNetworks).join(', ')}`);
        return;
      }

      // Get contract address from environment variables
      const envVarName = `REACT_APP_${networkKey}_CONTRACT_ADDRESS`;
      const contractAddress = process.env[envVarName];

      if (!contractAddress) {
        throw new Error(`Contract address not found for ${networkKey} network`);
      }

      // Initialize provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize contract
      const contractInstance = await getContract(contractAddress, signer);

      // Update state
      setNetworkName(networkKey);
      setContract(contractInstance);
    } catch (error) {
      console.error('Web3 initialization error:', error);
      alert(`Error connecting to network: ${error.message}`);
    }
  };

  useEffect(() => {
    const handleChainChanged = () => {
      window.location.reload();
    };

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || '');
      if (accounts[0]) {
        initWeb3();
      }
    };

    // Add event listeners
    window.ethereum?.on('chainChanged', handleChainChanged);
    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    // Cleanup
    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  return (
    <Web3Context.Provider value={{ account, contract, networkName, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}

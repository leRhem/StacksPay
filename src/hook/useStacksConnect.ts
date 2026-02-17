import { useState, useEffect } from 'react';
import {
  connect,
  disconnect as stacksDisconnect,
  isConnected as stacksIsConnected,
  getLocalStorage,
} from '@stacks/connect';
import { useStacks } from '../components/StacksProvider';

export function useStacksConnect() {
  // ── Network from the shared StacksProvider context ───────────────
  const {
    network,
    networkType,
    isMainnet,
    setNetwork,
    userSession,
  } = useStacks();

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);

  // Re-check connection whenever the network type changes
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isOk = stacksIsConnected() || userSession.isUserSignedIn();
        setIsConnected(isOk);

        if (isOk) {
          if (userSession.isUserSignedIn()) {
            const data = userSession.loadUserData();
            // Use the reactive networkType to select the right address
            const address = networkType === 'mainnet'
              ? data?.profile?.stxAddress?.mainnet
              : data?.profile?.stxAddress?.testnet;
            setUserAddress(address ?? '');
            setUserData(data ?? null);
          } else {
            const storage = getLocalStorage();
            if (storage?.addresses?.stx?.[0]) {
              setUserAddress(storage.addresses.stx[0].address ?? '');
            }
          }
        } else {
          // Not connected — clear stale state
          setUserAddress('');
          setUserData(null);
        }
      } catch (error) {
        console.error('Error during connection check:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkConnection();
  }, [networkType, userSession]);

  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const res = await connect();

      // Guard against null/undefined result
      if (!res || !res.addresses || !Array.isArray(res.addresses)) {
        console.error('Invalid response from connect():', res);
        return;
      }

      // Safely find STX address
      const stxAddressObj = res.addresses.find(a => a.symbol === 'STX');
      const stxAddress = stxAddressObj?.address ?? res.addresses[0]?.address ?? '';

      // Look up network-specific STX addresses; fall back to the generic stxAddressObj
      const mainnetAddr = res.addresses.find(a => a.symbol === 'STX' && (a as any).network === 'mainnet')?.address
        ?? stxAddressObj?.address ?? stxAddress;
      const testnetAddr = res.addresses.find(a => a.symbol === 'STX' && (a as any).network === 'testnet')?.address
        ?? stxAddressObj?.address ?? stxAddress;

      // Pick the address matching the current reactive network
      const activeAddr = networkType === 'mainnet' ? mainnetAddr : testnetAddr;
      setUserAddress(activeAddr);

      // Normalize userData shape to be consistent with userSession.loadUserData()
      setUserData({
        profile: {
          stxAddress: {
            mainnet: mainnetAddr,
            testnet: testnetAddr,
          },
        },
        addresses: res.addresses,
        stxAddress: activeAddr,
      });
      setIsConnected(true);
    } catch (error: any) {
      if (error?.message?.includes('User rejected') || error?.code === 4001) {
        console.log('User cancelled wallet connection');
      } else {
        console.error('Wallet connection failed', error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    stacksDisconnect();
    userSession.signUserOut();
    setIsConnected(false);
    setIsLoading(false);
    setUserAddress('');
    setUserData(null);
    window.location.href = '/';
  };

  return {
    isConnected,
    isLoading,
    userAddress,
    userData,
    connectWallet,
    disconnect,
    userSession,
    network,
    networkType,
    isMainnet,
    setNetwork,
  };
}

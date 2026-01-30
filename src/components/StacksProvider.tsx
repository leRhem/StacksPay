import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppConfig, UserSession, authenticate } from '@stacks/connect';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

interface StacksContextType {
  userSession: UserSession;
  userData: any;
  authenticate: () => void;
  signOut: () => void;
  network: any;
  isMainnet: boolean;
  setNetwork: (network: 'mainnet' | 'testnet') => void;
}

const StacksContext = createContext<StacksContextType>({} as StacksContextType);

export const StacksProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMainnet, setIsMainnet] = useState(false);
  const network = isMainnet ? STACKS_MAINNET : STACKS_TESTNET;
  
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn()
        .then((userData) => {
          setUserData(userData);
        })
        .catch((err) => {
          console.error('Failed to handle pending sign-in:', err);
        });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const login = () => {
    authenticate({
      appDetails: {
        name: 'StacksPay',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const signOut = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  return (
    <StacksContext.Provider value={{
      userSession,
      userData,
      authenticate: login,
      signOut,
      network,
      isMainnet,
      setNetwork: (net) => setIsMainnet(net === 'mainnet')
    }}>
      {children}
    </StacksContext.Provider>
  );
};

export const useStacks = () => useContext(StacksContext);

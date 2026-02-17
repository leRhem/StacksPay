import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

// ── Constants ──────────────────────────────────────────────────────
const STORAGE_KEY = 'stackspay_network';
const isDev = import.meta.env.DEV;

/** Read the initial network from localStorage → env var → 'testnet' */
function getInitialNetwork(): 'mainnet' | 'testnet' {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'mainnet' || stored === 'testnet') return stored;
    } catch {
      // Storage unavailable (e.g. Safari private mode) — fall through
    }
  }
  const env = import.meta.env.VITE_STX_NETWORK;
  if (env === 'mainnet' || env === 'testnet') return env;
  return 'testnet';
}

/** Build a network object, overriding coreApiUrl in dev to route through Vite proxy */
function buildNetwork(type: 'mainnet' | 'testnet') {
  const base = type === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
  if (!isDev) return base;
  return {
    ...base,
    coreApiUrl: type === 'mainnet' ? '/api/stacks-mainnet' : '/api/stacks-testnet',
  };
}

// ── Context ────────────────────────────────────────────────────────
interface StacksContextType {
  userSession: UserSession;
  userData: any;
  authenticate: () => void;
  signOut: () => void;
  /** Dev-proxy-aware network object (passed to Stacks SDK calls) */
  network: any;
  /** 'mainnet' | 'testnet' */
  networkType: 'mainnet' | 'testnet';
  isMainnet: boolean;
  setNetwork: (network: 'mainnet' | 'testnet') => void;
}

const StacksContext = createContext<StacksContextType>({} as StacksContextType);

// ── Stable singletons (never change across renders) ────────────────
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

// ── Provider ───────────────────────────────────────────────────────
export const StacksProvider = ({ children }: { children: React.ReactNode }) => {
  const [networkType, setNetworkType] = useState<'mainnet' | 'testnet'>(getInitialNetwork);
  const isMainnet = networkType === 'mainnet';

  // Persist choice & derive the SDK network object
  const network = useMemo(() => buildNetwork(networkType), [networkType]);

  const setNetwork = (net: 'mainnet' | 'testnet') => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, net);
      } catch {
        // Storage unavailable — silently skip persistence
      }
    }
    setNetworkType(net);
  };

  // ── Legacy auth (kept for compatibility with StacksProvider consumers) ──
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn()
        .then((data) => setUserData(data))
        .catch((err) => console.error('Failed to handle pending sign-in:', err));
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const authenticate = () => {
    // Kept as a no-op / legacy entry point.
    // The primary connect flow lives in useStacksConnect → connect().
    console.warn('StacksProvider.authenticate() is deprecated — use useStacksConnect().connectWallet() instead.');
  };

  const signOut = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  return (
    <StacksContext.Provider value={{
      userSession,
      userData,
      authenticate,
      signOut,
      network,
      networkType,
      isMainnet,
      setNetwork,
    }}>
      {children}
    </StacksContext.Provider>
  );
};

export const useStacks = () => useContext(StacksContext);

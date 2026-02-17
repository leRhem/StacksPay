import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useStacksConnect } from '../hook/useStacksConnect';
import { Icons } from '../components/Icons';
import { MagneticButton } from '../components/MagneticButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { userSession, connectWallet, disconnect, userData, networkType } = useStacksConnect();
  const location = useLocation();

  const handleConnect = () => {
      connectWallet();
  };

  const navItems = [
    { name: 'Overview', icon: <Icons.Layers />, path: '/dashboard' },
    { name: 'Companies', icon: <Icons.Building />, path: '/companies' },
    { name: 'Settings', icon: <Icons.Shield />, path: '/settings' },
  ];

  // If not signed in, show connect view (simple protection)
  // In a real app, this might redirect or show a "Connect Wallet" wall
  if (!userSession.isUserSignedIn()) {
      return (
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 animate-pulse text-kinetic-orange">
                  <Icons.Zap />
              </div>
              <h1 className="text-4xl font-display font-bold mb-4">Welcome to StacksPay</h1>
              <p className="text-gray-400 mb-8 text-center max-w-md">Connect your Stacks wallet to access your decentralized payroll dashboard.</p>
              <MagneticButton onClick={handleConnect} className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform">
                  Connect Wallet
              </MagneticButton>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-white flex pt-[88px]">
       {/* Sidebar */}
       <aside className="w-64 border-r border-white/10 hidden md:flex flex-col p-6 gap-2 fixed top-[88px] bottom-0 left-0 bg-black z-40">
         <div className="mb-8 pl-4 text-xs font-mono text-gray-500 uppercase tracking-widest">Main Menu</div>
         
         {navItems.map((item) => (
           <Link key={item.path} to={item.path}>
             <div className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors ${location.pathname === item.path || (item.path === '/companies' && location.pathname.startsWith('/company')) ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                 <div className="w-5 h-5">{item.icon}</div>
                 <span className="font-medium">{item.name}</span>
             </div>
           </Link>
         ))}
         
         <div className="mt-auto">
             <div className="p-4 rounded-xl bg-kinetic-purple/10 border border-kinetic-purple/20 text-sm mb-4">
                <div className="flex items-center gap-2 mb-2 font-bold capitalize text-white">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${networkType === 'mainnet' ? 'bg-green-500' : 'bg-kinetic-orange'}`} />
                    {networkType} Active
                </div>
                <div className="text-gray-400 font-mono text-xs truncate">
                    {userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet || 'Connected'}
                </div>
             </div>
             
             <button onClick={disconnect} className="w-full py-3 text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2 justify-center">
                 Sign Out
             </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 overflow-y-auto">
          {children}
      </main>
    </div>
  );
};

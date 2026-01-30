import { useState } from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { MagneticButton } from '../components/MagneticButton';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DepositModal } from '../components/modals/DepositModal';

export const Payroll = () => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <DashboardLayout>
       <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />

       <header className="flex justify-between items-center mb-12">
           <div>
              <h1 className="text-4xl font-display font-bold mb-2">Payroll Management</h1>
              <p className="text-gray-400">Manage deposits, payment cycles, and disbursements.</p>
           </div>
           <div className="flex gap-4">
               <MagneticButton className="px-6 py-3 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/5">
                  View History
               </MagneticButton>
               <MagneticButton onClick={() => setIsDepositModalOpen(true)} className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm">
                  + Deposit Funds
               </MagneticButton>
           </div>
        </header>

         {/* Vault Overview */}
         <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-10 relative overflow-hidden group">
                 <div className="absolute right-0 top-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Icons.Shield />
                 </div>
                 <div className="relative z-10">
                     <h3 className="text-gray-400 font-mono mb-2">VAULT BALANCE</h3>
                     <div className="text-5xl font-bold mb-6">0.00 <span className="text-xl text-gray-500 font-normal">STX</span></div>
                     <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-4">
                         <div className="bg-kinetic-green h-full w-[0%]" />
                     </div>
                     <p className="text-sm text-gray-400">Runway: 0 Days</p>
                 </div>
            </Card>

            <Card className="p-10 relative overflow-hidden bg-[#111]">
                 <div className="relative z-10">
                     <h3 className="text-gray-400 font-mono mb-2">NEXT PAYDAY</h3>
                     <div className="text-5xl font-bold mb-6">Oct 24 <span className="text-xl text-gray-500 font-normal">2026</span></div>
                     <p className="text-gray-400 mb-8">Estimated total outflow: <span className="text-white font-bold">4,200 STX</span></p>
                     
                     <MagneticButton className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 disabled:opacity-50">
                         Advance Period (Locked)
                     </MagneticButton>
                 </div>
            </Card>
         </div>

         {/* Recent Runs */}
         <Card className="p-8">
             <h3 className="text-xl font-bold mb-6">Payroll History</h3>
             <div className="text-center py-20 text-gray-500">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Icons.Clock />
                 </div>
                 <p>No payroll runs completed yet.</p>
             </div>
         </Card>
    </DashboardLayout>
  );
};

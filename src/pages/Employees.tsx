import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { MagneticButton } from '../components/MagneticButton';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';

export const Employees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardLayout>
       <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
       
       <header className="flex justify-between items-center mb-12">
           <div>
              <h1 className="text-4xl font-display font-bold mb-2">Employees</h1>
              <p className="text-gray-400">Manage your team, salaries, and streaming payments.</p>
           </div>
           <div className="flex gap-4">
               <MagneticButton onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm">
                  + Add Employee
               </MagneticButton>
           </div>
        </header>

         <Card className="p-0 overflow-hidden">
             <div className="p-6 border-b border-white/10 flex gap-4 items-center">
                 <div className="flex-1 bg-white/5 rounded-lg flex items-center px-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
                     <Icons.Zap />
                     <input type="text" placeholder="Search employees..." className="bg-transparent border-none outline-none ml-2 w-full text-sm text-white" />
                 </div>
                 <div className="flex gap-2">
                     <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold border border-white/5">Filter: Active</button>
                 </div>
             </div>
             
             {/* Empty State */}
             <div className="text-center py-32">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Icons.Users />
                 </div>
                 <h3 className="text-xl font-bold mb-2">No employees found</h3>
                 <p className="text-gray-400 max-w-sm mx-auto mb-8">Get started by adding your first employee to the payroll smart contract.</p>
                 <MagneticButton onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-kinetic-purple text-white rounded-full font-bold text-sm">
                    Add First Employee
                 </MagneticButton>
             </div>
         </Card>
    </DashboardLayout>
  );
};

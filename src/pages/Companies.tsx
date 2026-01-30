import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { MagneticButton } from '../components/MagneticButton';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { CreateCompanyModal } from '../components/modals/CreateCompanyModal';
import { Icons } from '../components/Icons';

export const Companies = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('stackspay_companies');
        if (saved) {
            setCompanies(JSON.parse(saved));
        }
    }, []);

    const handleCompanyKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const input = e.currentTarget;
            const val = input.value.trim();
            if (val) {
               // Quick add/select existing company ID manually
               const exists = companies.find(c => c.id === val);
               if (!exists) {
                   const newCompany = { id: val, name: val };
                   const updated = [...companies, newCompany];
                   setCompanies(updated);
                   localStorage.setItem('stackspay_companies', JSON.stringify(updated));
               }
               navigate(`/companies/${val}`);
            }
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                         <h1 className="text-4xl font-display font-bold mb-2">My Organizations</h1>
                         <p className="text-gray-400">Select an organization to manage payroll and employees.</p>
                    </div>
                    <MagneticButton 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-kinetic-purple rounded-xl font-bold flex items-center gap-2"
                    >
                        <Icons.Plus className="w-5 h-5" />
                        <span>Register New Company</span>
                    </MagneticButton>
                </div>

                {companies.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                         <div className="inline-flex p-4 rounded-full bg-white/5 mb-4 text-gray-400">
                             <Icons.Building />
                         </div>
                         <h3 className="text-xl font-bold mb-2">No Organizations Found</h3>
                         <p className="text-gray-400 max-w-md mx-auto mb-8">
                             You haven't connected any organizations yet. Register a new one on-chain or import an existing Company ID.
                         </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map(company => (
                            <Card 
                                key={company.id}
                                onClick={() => navigate(`/companies/${company.id}`)}
                                className="p-6 cursor-pointer hover:border-kinetic-purple/50 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-white/5 rounded-xl text-white group-hover:bg-kinetic-purple group-hover:text-black transition-colors">
                                        <Icons.Building />
                                    </div>
                                    <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded font-mono">
                                        Active
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{company.name}</h3>
                                <p className="text-sm text-gray-400 font-mono mb-4">{company.id}</p>
                                <div className="text-sm text-kinetic-purple flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Manage Dashboard <Icons.ChevronRight className="w-4 h-4" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                
                <div className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="text-lg font-bold mb-4">Import Existing Organization</h3>
                    <div className="max-w-md">
                        <input 
                            onKeyDown={handleCompanyKeydown}
                            placeholder="Enter Company ID and press Enter..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                        />
                         <p className="text-xs text-gray-500 mt-2">
                            e.g. 'rhema-inc'. This purely adds it to your local list for quick access.
                        </p>
                    </div>
                </div>

                <CreateCompanyModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                />
            </div>
        </DashboardLayout>
    );
};

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import { MagneticButton } from '../components/MagneticButton';
import { Icons } from '../components/Icons';
import { DepositModal } from '../components/modals/DepositModal';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';
import { useStacksPay } from '../hook/useStacksPay';
import { useStacksConnect } from '../hook/useStacksConnect';

export const CompanyDetails = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { network } = useStacksConnect();
    const { getCompany, getCompanyStats } = useStacksPay();
    
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'payroll'>('overview');
    
    const [companyData, setCompanyData] = useState<any>(null);
    const [companyStats, setCompanyStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCompanyData = async () => {
        if (!companyId || !network) return;
        
        try {
            const details = await getCompany(companyId);
            const stats = await getCompanyStats(companyId);

            if (details) {
                setCompanyData(details);
            }
            if (stats) {
                setCompanyStats(stats);
            }
        } catch (error) {
            console.error("Error fetching company data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanyData();
    }, [companyId, network]);

    const formatSTX = (val: any) => {
        if (!val) return '0.00';
        const num = typeof val === 'object' ? Number(val.value) : Number(val);
        return (num / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    if (!companyId) return <div className="p-10 text-center text-red-500">Invalid Company ID</div>;

    return (
        <DashboardLayout>
            <div className="mb-8">
                <button 
                  onClick={() => navigate('/companies')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <Icons.ArrowLeft className="w-4 h-4" /> Back to Organizations
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-display font-bold mb-1">
                            {companyData ? companyData.name.value : companyId}
                        </h1>
                        <p className="text-gray-400">
                             ID: <span className="font-mono text-white">{companyId}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <MagneticButton 
                            onClick={() => setIsDepositModalOpen(true)}
                            className="px-6 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2"
                        >
                            <Icons.Wallet className="w-5 h-5" />
                            <span>Fund Vault</span>
                        </MagneticButton>
                        <MagneticButton 
                            onClick={() => setIsAddEmployeeModalOpen(true)}
                            className="px-6 py-3 bg-kinetic-purple rounded-xl font-bold flex items-center gap-2"
                        >
                            <Icons.Plus className="w-5 h-5" />
                            <span>Add Employee</span>
                        </MagneticButton>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="p-6">
                    <div className="text-gray-400 text-sm mb-2">Vault Balance</div>
                    <div className="text-3xl font-bold font-mono">
                        {loading ? '...' : formatSTX(companyData?.['total-balance'] || 0)} <span className="text-lg text-kinetic-purple">STX</span>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="text-gray-400 text-sm mb-2">Active Employees</div>
                    <div className="text-3xl font-bold">
                        {loading ? '...' : Number(companyData?.['active-employees-count']?.value || 0)}
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="text-gray-400 text-sm mb-2">Paid Out (Total)</div>
                     <div className="text-3xl font-bold font-mono">
                        {loading ? '...' : formatSTX(companyStats?.['total-paid-out'] || 0)} <span className="text-lg text-gray-500">STX</span>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mb-8 flex gap-8 overflow-x-auto">
                {['overview', 'employees', 'payroll'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 capitalize font-bold transition-colors border-b-2 whitespace-nowrap ${
                            activeTab === tab 
                            ? 'text-white border-kinetic-purple' 
                            : 'text-gray-500 border-transparent hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-6">
                            <h3 className="font-bold mb-4">Contract Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Total Deposited</span>
                                    <span className="font-mono">{formatSTX(companyStats?.['total-deposited'] || 0)} STX</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Current Period</span>
                                    <span className="font-mono">#{Number(companyData?.['current-period']?.value || 0)}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Pay Frequency</span>
                                    <span className="font-mono">{Number(companyData?.['pay-frequency']?.value) === 1 ? 'Weekly' : Number(companyData?.['pay-frequency']?.value) === 2 ? 'Bi-Weekly' : 'Monthly'}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className="space-y-4">
                         <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
                            <Icons.Users />
                            <h3 className="text-lg font-bold mt-2">Employee List</h3>
                            <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1 mb-4">
                                The smart contract currently has {Number(companyData?.['active-employees-count']?.value || 0)} active employees. 
                                Full list fetching will be available in the next update.
                            </p>
                            <MagneticButton 
                                onClick={() => setIsAddEmployeeModalOpen(true)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold"
                            >
                                Add New Employee
                            </MagneticButton>
                        </div>
                    </div>
                )}
                
                {activeTab === 'payroll' && (
                     <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                         <div className="inline-flex p-4 rounded-full bg-white/5 mb-4 text-gray-400">
                             <Icons.Clock />
                         </div>
                         <h3 className="text-xl font-bold mb-2">No Recent Payroll Runs</h3>
                         <p className="text-gray-400">Run payroll to generate history.</p>
                     </div>
                )}
            </div>

            <DepositModal 
                isOpen={isDepositModalOpen} 
                onClose={() => {
                    setIsDepositModalOpen(false);
                    fetchCompanyData(); // Refresh data after deposit
                }}
                companyId={companyId}
            />
            <AddEmployeeModal 
                isOpen={isAddEmployeeModalOpen} 
                onClose={() => {
                    setIsAddEmployeeModalOpen(false);
                    fetchCompanyData(); // Refresh data after adding employee
                }} 
                companyId={companyId}
            />
        </DashboardLayout>
    );
};

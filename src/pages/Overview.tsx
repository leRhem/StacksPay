import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useStacksPay } from '../hook/useStacksPay';
import { useStacksConnect } from '../hook/useStacksConnect';

export const Overview = () => {
    const { network, networkType } = useStacksConnect();
    const { getCompany, getCompanyStats } = useStacksPay();

    const [stats, setStats] = useState({
        totalBalance: 0,
        totalEmployees: 0,
        activeCompanies: 0,
        totalPaidOut: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOverviewData = async () => {
             // 1. Get local companies
             const saved = localStorage.getItem('stackspay_companies');
             if (!saved) {
                 setIsLoading(false);
                 return;
             }
             const companies = JSON.parse(saved);
             
             let balanceSum = 0;
             let employeesSum = 0;
             let paidOutSum = 0;

             // 2. Fetch data using hook
             await Promise.all(companies.map(async (company: {id: string}) => {
                 try {
                     const details = await getCompany(company.id);
                     const statsDetails = await getCompanyStats(company.id);

                     if (details) {
                         balanceSum += Number(details['total-balance'] || 0);
                         employeesSum += Number(details['active-employees-count'] || 0);
                     }
                     if (statsDetails) {
                         paidOutSum += Number(statsDetails['total-paid-out'] || 0);
                     }

                 } catch (e) {
                     console.error(`Failed to fetch data for ${company.id}`, e);
                 }
             }));

             setStats({
                 totalBalance: balanceSum,
                 totalEmployees: employeesSum,
                 activeCompanies: companies.length,
                 totalPaidOut: paidOutSum
             });
             setIsLoading(false);
        };

        if (network) {
            fetchOverviewData();
        }
    }, [network]);

    const formatSTX = (microStx: number) => {
        return (microStx / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-4xl font-display font-bold mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">High-level performance of your decentralized payrolls.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card className="p-6 border-l-4 border-kinetic-purple">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-400 text-sm">Total Liquidity</div>
                        <Icons.Wallet />
                    </div>
                    <div className="text-3xl font-bold font-mono">
                        {isLoading ? '...' : formatSTX(stats.totalBalance)} <span className="text-sm text-gray-500">STX</span>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-400 text-sm">Active Companies</div>
                        <Icons.Building />
                    </div>
                    <div className="text-3xl font-bold">
                        {isLoading ? '...' : stats.activeCompanies}
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-400 text-sm">Employees Managed</div>
                        <Icons.Users />
                    </div>
                    <div className="text-3xl font-bold">
                        {isLoading ? '...' : stats.totalEmployees}
                    </div>
                </Card>
                
                <Card className="p-6 border-l-4 border-orange-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-400 text-sm">Total Paid Out</div>
                        <Icons.TrendingUp />
                    </div>
                    <div className="text-3xl font-bold font-mono">
                        {isLoading ? '...' : formatSTX(stats.totalPaidOut)} <span className="text-sm text-gray-500">STX</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Icons.Zap /> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => window.location.href='/companies'} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors border border-white/5 hover:border-kinetic-purple/50">
                            <div className="font-bold mb-1">Manage Companies</div>
                            <div className="text-xs text-gray-400">View and edit your organizations</div>
                        </button>
                        <button onClick={() => window.location.href='/settings'} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors border border-white/5 hover:border-kinetic-purple/50">
                             <div className="font-bold mb-1">System Settings</div>
                             <div className="text-xs text-gray-400">Configure network nodes</div>
                        </button>
                    </div>
                </Card>

                <Card className="p-8 flex flex-col justify-center items-center text-center opacity-75">
                    <div className="p-4 bg-white/5 rounded-full mb-4">
                        <Icons.Stacks />
                    </div>
                    <h3 className="font-bold mb-2">Stacks Network Status</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono ${networkType === 'mainnet' ? 'bg-green-500/20 text-green-400' : 'bg-kinetic-orange/20 text-kinetic-orange'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${networkType === 'mainnet' ? 'bg-green-500' : 'bg-kinetic-orange'}`} />
                        Connected to {networkType}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

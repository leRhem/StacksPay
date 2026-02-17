import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import { MagneticButton } from '../components/MagneticButton';
import { Icons } from '../components/Icons';
import { DepositModal } from '../components/modals/DepositModal';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';
import { AddBonusModal } from '../components/modals/AddBonusModal';
import { useStacksPay } from '../hook/useStacksPay';
import { useStacksConnect } from '../hook/useStacksConnect';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, standardPrincipalCV, uintCV, PostConditionMode } from '@stacks/transactions';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../consts';
import { useToast } from '../context/ToastContext';

interface EmployeeRecord {
    address: string;
    name?: string;
    salary?: number;
    isActive?: boolean;
    totalEarned?: number;
    department?: string;
    role?: string;
    loading: boolean;
}

// --- Local Storage Helpers ---
function getLocalEmployees(companyId: string): string[] {
    const key = `stackspay_employees_${companyId}`;
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error(`Malformed employee data in localStorage for key "${key}", resetting.`, err);
        localStorage.removeItem(key);
        return [];
    }
}

function saveLocalEmployee(companyId: string, address: string) {
    const employees = getLocalEmployees(companyId);
    if (!employees.includes(address)) {
        employees.push(address);
        localStorage.setItem(`stackspay_employees_${companyId}`, JSON.stringify(employees));
    }
}

export const CompanyDetails = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { network } = useStacksConnect();
    const { getCompany, getCompanyStats, getEmployee, getCurrentPeriod, canAdvancePeriod } = useStacksPay();
    const showToast = useToast();
    
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'payroll'>('overview');
    
    const [companyData, setCompanyData] = useState<any>(null);
    const [companyStats, setCompanyStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Employee management state
    const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [newEmployeeAddress, setNewEmployeeAddress] = useState('');
    const [editingSalary, setEditingSalary] = useState<{ address: string; value: string } | null>(null);
    const [pendingRemovals, setPendingRemovals] = useState<Set<string>>(new Set());

    // Payroll tab state
    const [periodInfo, setPeriodInfo] = useState<any>(null);
    const [canAdvance, setCanAdvance] = useState(false);
    const [isAdvancingPeriod, setIsAdvancingPeriod] = useState(false);
    const [claimLinkCopied, setClaimLinkCopied] = useState(false);

    const fetchCompanyData = useCallback(async () => {
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
    }, [companyId, network]);

    const fetchPayrollInfo = useCallback(async () => {
        if (!companyId || !network) return;
        try {
            const [period, canAdv] = await Promise.all([
                getCurrentPeriod(companyId),
                canAdvancePeriod(companyId),
            ]);
            setPeriodInfo(period);
            setCanAdvance(!!canAdv);
        } catch (err) {
            console.error('Failed to fetch payroll info:', err);
        }
    }, [companyId, network, getCurrentPeriod, canAdvancePeriod]);

    // Fetch employee data from chain using locally tracked addresses
    const fetchEmployees = useCallback(async () => {
        if (!companyId || !network) return;

        const addresses = getLocalEmployees(companyId);
        const records: EmployeeRecord[] = addresses.map(addr => ({
            address: addr,
            loading: true,
        }));
        setEmployees(records);

        // Fetch each employee's on-chain data
        const updated = await Promise.all(
            addresses.map(async (addr) => {
                try {
                    const data = await getEmployee(companyId, addr);
                    if (data) {
                        return {
                            address: addr,
                            name: data['employee-name'] || addr,
                            salary: Number(data['salary-per-period'] || 0),
                            isActive: data['is-active'] ?? true,
                            totalEarned: Number(data['total-earned'] || 0),
                            department: data['department'] || null,
                            role: data['role'] || null,
                            loading: false,
                        };
                    }
                    return { address: addr, loading: false, name: addr };
                } catch {
                    return { address: addr, loading: false, name: addr };
                }
            })
        );
        setEmployees(updated);
    }, [companyId, network, getEmployee]);

    useEffect(() => {
        fetchCompanyData();
        fetchPayrollInfo();
    }, [fetchCompanyData, fetchPayrollInfo]);

    useEffect(() => {
        if (activeTab === 'employees' || activeTab === 'payroll') {
            fetchEmployees();
        }
    }, [activeTab, fetchEmployees]);

    const formatSTX = (val: any) => {
        if (!val) return '0.00';
        const num = typeof val === 'object' ? Number(val.value) : Number(val);
        return (num / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    // --- Contract interaction handlers ---
    const handleRemoveEmployee = async (employeeAddress: string) => {
        if (!companyId || !network) return;
        try {
            // Mark as pending in UI
            setPendingRemovals(prev => new Set(prev).add(employeeAddress));

            await openContractCall({
                network,
                contractAddress: FIXED_CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'remove-employee',
                functionArgs: [
                    stringUtf8CV(companyId),
                    standardPrincipalCV(employeeAddress),
                ],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [], // remove-employee doesn't transfer STX
                onFinish: (data) => {
                    console.log('Remove employee tx broadcast:', data.txId);
                    showToast({
                        type: 'success',
                        title: 'Transaction Broadcast',
                        message: `Remove employee tx submitted (${data.txId.slice(0, 10)}…). Employee will be deactivated after confirmation.`,
                    });
                    // Mark employee as visually pending — data refreshes on next tab visit
                    setPendingRemovals(prev => { const s = new Set(prev); s.delete(employeeAddress); return s; });
                },
                onCancel: () => {
                    console.log('User cancelled employee removal');
                    setPendingRemovals(prev => { const s = new Set(prev); s.delete(employeeAddress); return s; });
                },
            });
        } catch (error) {
            console.error('Remove employee failed:', error);
            setPendingRemovals(prev => { const s = new Set(prev); s.delete(employeeAddress); return s; });
        }
    };

    const handleUpdateSalary = async (employeeAddress: string, newSalary: string) => {
        if (!companyId || !network) return;

        // Validate salary input
        const parsed = parseInt(newSalary, 10);
        if (!newSalary || isNaN(parsed) || !isFinite(parsed) || parsed <= 0 || String(parsed) !== newSalary.trim()) {
            showToast({ type: 'error', title: 'Invalid Salary', message: 'Salary must be a positive whole number.' });
            return;
        }

        try {
            await openContractCall({
                network,
                contractAddress: FIXED_CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'update-salary',
                functionArgs: [
                    stringUtf8CV(companyId),
                    standardPrincipalCV(employeeAddress),
                    uintCV(parsed),
                ],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [], // update-salary doesn't transfer STX
                onFinish: (data) => {
                    console.log('Update salary tx broadcast:', data.txId);
                    showToast({
                        type: 'success',
                        title: 'Transaction Broadcast',
                        message: `Salary update tx submitted. New salary will apply after confirmation.`,
                    });
                    setEditingSalary(null);
                },
                onCancel: () => console.log('User cancelled salary update'),
            });
        } catch (error) {
            console.error('Update salary failed:', error);
            showToast({ type: 'error', title: 'Transaction Failed', message: 'Could not initiate salary update.' });
        }
    };

    const handleAdvancePeriod = async () => {
        if (!companyId || !network) return;
        try {
            setIsAdvancingPeriod(true);
            await openContractCall({
                network,
                contractAddress: FIXED_CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'advance-period',
                functionArgs: [stringUtf8CV(companyId)],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [],
                onFinish: (data) => {
                    showToast({
                        type: 'success',
                        title: 'Period Advanced',
                        message: `Advance period tx broadcast (${data.txId.slice(0, 10)}…). Period will update after confirmation.`,
                    });
                    setIsAdvancingPeriod(false);
                },
                onCancel: () => setIsAdvancingPeriod(false),
            });
        } catch (err) {
            console.error('Advance period failed:', err);
            showToast({ type: 'error', title: 'Transaction Failed', message: 'Could not advance period.' });
            setIsAdvancingPeriod(false);
        }
    };

    const handleCopyClaimLink = async () => {
        const link = `${window.location.origin}/claim/${companyId}`;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(link);
            } else {
                // Legacy fallback
                const textarea = document.createElement('textarea');
                textarea.value = link;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setClaimLinkCopied(true);
            showToast({ type: 'info', title: 'Link Copied', message: 'Employee claim link copied to clipboard.' });
            setTimeout(() => setClaimLinkCopied(false), 2000);
        } catch (err) {
            console.error('Copy to clipboard failed:', err);
            showToast({ type: 'error', title: 'Copy Failed', message: 'Could not copy link. Please copy it manually.' });
        }
    };

    const handleImportEmployee = () => {
        if (!companyId || !newEmployeeAddress.trim()) return;
        saveLocalEmployee(companyId, newEmployeeAddress.trim());
        setNewEmployeeAddress('');
        fetchEmployees();
    };

    // Filter employees by search
    const filteredEmployees = employees.filter(emp => {
        const q = employeeSearch.toLowerCase();
        return (
            emp.address.toLowerCase().includes(q) ||
            (emp.name && emp.name.toLowerCase().includes(q)) ||
            (emp.department && emp.department.toLowerCase().includes(q))
        );
    });

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
                            {companyData ? companyData.name : companyId}
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
                        {loading ? '...' : Number(companyData?.['active-employees-count'] || 0)}
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
                                    <span className="font-mono">#{Number(companyData?.['current-period'] || 0)}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-400">Pay Frequency</span>
                                    <span className="font-mono">{Number(companyData?.['pay-frequency']) === 1 ? 'Weekly' : Number(companyData?.['pay-frequency']) === 2 ? 'Bi-Weekly' : 'Monthly'}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className="space-y-6">
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 bg-white/5 rounded-xl flex items-center px-4 py-3 border border-white/5 focus-within:border-kinetic-purple/50 transition-colors">
                                <Icons.Zap />
                                <input
                                    type="text"
                                    placeholder="Search by name, address, or department..."
                                    value={employeeSearch}
                                    onChange={e => setEmployeeSearch(e.target.value)}
                                    className="bg-transparent border-none outline-none ml-3 w-full text-sm text-white placeholder-gray-500"
                                />
                            </div>
                            <MagneticButton 
                                onClick={() => setIsAddEmployeeModalOpen(true)}
                                className="px-6 py-3 bg-kinetic-purple rounded-xl font-bold text-sm flex items-center gap-2 shrink-0"
                            >
                                <Icons.Plus className="w-4 h-4" /> Add Employee
                            </MagneticButton>
                        </div>

                        {/* Employee List */}
                        {filteredEmployees.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Icons.Users />
                                </div>
                                <h3 className="text-lg font-bold mb-2">No Employees Found</h3>
                                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                                    Add employees to this organization via the smart contract or import existing ones.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <MagneticButton 
                                        onClick={() => setIsAddEmployeeModalOpen(true)}
                                        className="px-6 py-3 bg-kinetic-purple rounded-xl font-bold text-sm"
                                    >
                                        Add Employee On-Chain
                                    </MagneticButton>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredEmployees.map((emp) => (
                                    <Card key={emp.address} className="p-5 hover:border-white/20 transition-colors">
                                        {emp.loading ? (
                                            <div className="animate-pulse flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/10 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-white/10 rounded w-1/3" />
                                                    <div className="h-3 bg-white/5 rounded w-1/2" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${emp.isActive ? 'bg-kinetic-purple/20 text-kinetic-purple' : 'bg-red-500/20 text-red-400'}`}>
                                                        {(emp.name || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">{emp.name || 'Unknown'}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${emp.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {emp.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{emp.address}</div>
                                                        {emp.department && <div className="text-xs text-gray-400 mt-0.5">{emp.department}{emp.role ? ` · ${emp.role}` : ''}</div>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        {editingSalary?.address === emp.address ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editingSalary.value}
                                                                    onChange={e => setEditingSalary({ address: emp.address, value: e.target.value })}
                                                                    className="w-28 bg-black/50 border border-white/20 rounded-lg px-2 py-1 text-sm text-white outline-none font-mono"
                                                                    autoFocus
                                                                />
                                                                <button onClick={() => handleUpdateSalary(emp.address, editingSalary.value)} className="text-green-400 hover:text-green-300 text-xs font-bold">Save</button>
                                                                <button onClick={() => setEditingSalary(null)} className="text-gray-500 hover:text-white text-xs">Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="font-mono font-bold">{formatSTX(emp.salary || 0)} <span className="text-gray-500 text-sm">STX</span></div>
                                                                <div className="text-xs text-gray-500">per period</div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-mono text-sm">{formatSTX(emp.totalEarned || 0)} STX</div>
                                                        <div className="text-xs text-gray-500">earned</div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => setEditingSalary({ address: emp.address, value: String(emp.salary || 0) })}
                                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                            title="Edit Salary"
                                                        >
                                                            <Icons.Settings className="w-4 h-4" />
                                                        </button>
                                                        {emp.isActive && (
                                                            <button
                                                                onClick={() => handleRemoveEmployee(emp.address)}
                                                                disabled={pendingRemovals.has(emp.address)}
                                                                className={`p-2 rounded-lg transition-colors ${pendingRemovals.has(emp.address) ? 'bg-yellow-500/20 text-yellow-400 animate-pulse cursor-wait' : 'bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400'}`}
                                                                title={pendingRemovals.has(emp.address) ? 'Removal pending…' : 'Remove Employee'}
                                                            >
                                                                <Icons.Trash className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Import existing employee by address */}
                        <div className="pt-6 border-t border-white/10">
                            <h4 className="text-sm font-bold mb-3 text-gray-400">Import Existing Employee</h4>
                            <div className="flex gap-3 max-w-lg">
                                <input
                                    value={newEmployeeAddress}
                                    onChange={e => setNewEmployeeAddress(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleImportEmployee()}
                                    placeholder="Paste employee wallet address (ST...)"
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-kinetic-purple outline-none transition-colors"
                                />
                                <button
                                    onClick={handleImportEmployee}
                                    className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Import
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">If an employee was added on-chain but isn't showing, paste their address here to track them locally.</p>
                        </div>
                    </div>
                )}
                
                {activeTab === 'payroll' && (
                    <div className="space-y-8">
                        {/* Period Info & Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="p-6">
                                <h3 className="font-bold mb-4">Current Period</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-400">Period #</span>
                                        <span className="font-mono font-bold">{periodInfo?.['period-number'] ?? periodInfo?.['current-period'] ?? '—'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-400">Start Block</span>
                                        <span className="font-mono">{periodInfo?.['start-block'] ?? periodInfo?.['period-start-block'] ?? '—'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-400">End Block</span>
                                        <span className="font-mono">{periodInfo?.['end-block'] ?? '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Blocks Remaining</span>
                                        <span className="font-mono text-kinetic-purple">{periodInfo?.['blocks-remaining'] ?? '—'}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold mb-4">Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-400">Periods Completed</span>
                                        <span className="font-mono">{companyStats?.['total-periods-completed'] ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-400">Total Deposited</span>
                                        <span className="font-mono">{formatSTX(companyStats?.['total-deposited'] ?? 0)} STX</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-400">Total Paid Out</span>
                                        <span className="font-mono">{formatSTX(companyStats?.['total-paid-out'] ?? 0)} STX</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Bonuses</span>
                                        <span className="font-mono">{formatSTX(companyStats?.['total-bonuses-paid'] ?? 0)} STX</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Balance Warning */}
                        {companyData && employees.length > 0 && (() => {
                            const totalSalaries = employees.reduce((sum, e) => sum + (e.isActive ? (e.salary ?? 0) : 0), 0);
                            const balance = companyData['total-balance'] ?? 0;
                            if (totalSalaries > 0 && balance < totalSalaries) {
                                return (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                                        <div className="text-yellow-400 mt-0.5">⚠️</div>
                                        <div>
                                            <div className="font-bold text-yellow-400 mb-1">Low Vault Balance</div>
                                            <div className="text-sm text-yellow-200/80">
                                                The vault has <span className="font-mono font-bold">{formatSTX(balance)} STX</span> but the next period requires <span className="font-mono font-bold">{formatSTX(totalSalaries)} STX</span>.
                                                Fund the vault before employees claim.
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <MagneticButton
                                onClick={handleAdvancePeriod}
                                disabled={!canAdvance || isAdvancingPeriod}
                                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
                                    canAdvance && !isAdvancingPeriod
                                        ? 'bg-kinetic-purple text-white'
                                        : 'bg-white/10 text-gray-500'
                                } transition-all`}
                            >
                                <Icons.Clock className="w-5 h-5" />
                                {isAdvancingPeriod ? 'Broadcasting…' : 'Advance Period'}
                            </MagneticButton>

                            <MagneticButton
                                onClick={() => setIsBonusModalOpen(true)}
                                className="px-6 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2"
                            >
                                <Icons.Star className="w-5 h-5" />
                                Add Bonus
                            </MagneticButton>

                            <MagneticButton
                                onClick={handleCopyClaimLink}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2 transition-colors"
                            >
                                <Icons.Link className="w-5 h-5" />
                                {claimLinkCopied ? '✓ Copied!' : 'Copy Claim Link'}
                            </MagneticButton>
                        </div>
                    </div>
                )}
            </div>

            <DepositModal 
                isOpen={isDepositModalOpen} 
                onClose={() => {
                    setIsDepositModalOpen(false);
                    fetchCompanyData();
                }}
                companyId={companyId}
            />
            <AddEmployeeModal 
                isOpen={isAddEmployeeModalOpen} 
                onClose={(addedAddress?: string) => {
                    setIsAddEmployeeModalOpen(false);
                    // Track the new employee locally if address was returned
                    if (addedAddress && companyId) {
                        saveLocalEmployee(companyId, addedAddress);
                    }
                    fetchCompanyData();
                    if (activeTab === 'employees') fetchEmployees();
                }} 
                companyId={companyId}
            />
            <AddBonusModal
                isOpen={isBonusModalOpen}
                onClose={() => {
                    setIsBonusModalOpen(false);
                    fetchCompanyData();
                }}
                companyId={companyId}
                employeeAddresses={employees.filter(e => e.isActive).map(e => e.address)}
            />
        </DashboardLayout>
    );
};

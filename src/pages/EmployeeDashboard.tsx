import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { MagneticButton } from '../components/MagneticButton';
import { Icons } from '../components/Icons';
import { useStacksPay } from '../hook/useStacksPay';
import { useStacksConnect } from '../hook/useStacksConnect';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, uintCV, PostConditionMode, Pc } from '@stacks/transactions';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../consts';
import { useToast } from '../context/ToastContext';

const formatSTX = (microStx: number) => {
    if (microStx === 0) return '0';
    return (microStx / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};

export const EmployeeDashboard = () => {
    const { companyId } = useParams();
    const { network, userAddress } = useStacksConnect();
    const { getCompany, getEmployee, getEmployeeStats, getCurrentPeriod, getPeriodClaim } = useStacksPay();
    const showToast = useToast();

    const [companyData, setCompanyData] = useState<any>(null);
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [employeeStats, setEmployeeStats] = useState<any>(null);
    const [periodInfo, setPeriodInfo] = useState<any>(null);
    const [claimStatus, setClaimStatus] = useState<'unclaimed' | 'broadcast' | 'claimed' | 'loading'>('loading');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [isRequestingAdvance, setIsRequestingAdvance] = useState(false);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear any pending poll timeout on unmount
    useEffect(() => {
        return () => {
            if (pollTimeoutRef.current !== null) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (!companyId || !network || !userAddress) return;
        setLoading(true);
        setError(null);
        try {
            const [company, employee, stats, period] = await Promise.all([
                getCompany(companyId),
                getEmployee(companyId, userAddress),
                getEmployeeStats(companyId, userAddress),
                getCurrentPeriod(companyId),
            ]);

            setCompanyData(company);
            setEmployeeData(employee);
            setEmployeeStats(stats);
            setPeriodInfo(period);

            // Check if current period has been claimed
            if (period && employee) {
                const currentPeriod = period['period-number'] ?? period['current-period'] ?? 0;
                const claim = await getPeriodClaim(companyId, userAddress, currentPeriod);
                setClaimStatus(claim ? 'claimed' : 'unclaimed');
            } else {
                setClaimStatus('unclaimed');
            }
        } catch (err) {
            console.error('Error loading employee dashboard data:', err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [companyId, network, userAddress, getCompany, getEmployee, getEmployeeStats, getCurrentPeriod, getPeriodClaim]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleClaimSalary = async () => {
        if (!companyId || !network) return;
        if (claimStatus === 'claimed' || claimStatus === 'broadcast' || !isActive || isPending) return;
        try {
            setIsPending(true);
            await openContractCall({
                network,
                contractAddress: FIXED_CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'claim-salary',
                functionArgs: [stringUtf8CV(companyId)],
                // Deny any transfer the post-conditions don't explicitly allow
                postConditionMode: PostConditionMode.Deny,
                postConditions: [
                    // The contract sends at most (salary - advanceDebt) to the employee
                    Pc.principal(`${FIXED_CONTRACT_ADDRESS}.${CONTRACT_NAME}`)
                      .willSendLte(Math.max(salary - advanceDebt, 0))
                      .ustx(),
                ],
                onFinish: (data) => {
                    showToast({
                        type: 'success',
                        title: 'Claim Broadcast',
                        message: `Your salary claim tx was broadcast (${data.txId.slice(0, 10)}…). STX will arrive after confirmation.`,
                    });
                    // Mark as broadcast — not yet confirmed on-chain
                    setClaimStatus('broadcast');
                    setIsPending(false);
                    // Poll for confirmation after a delay (tracked for cleanup)
                    pollTimeoutRef.current = setTimeout(() => fetchData(), 15000);
                },
                onCancel: () => {
                    setIsPending(false);
                },
            });
        } catch (err) {
            console.error('Claim salary failed:', err);
            showToast({ type: 'error', title: 'Claim Failed', message: 'Could not initiate salary claim.' });
            setIsPending(false);
        }
    };

    const handleRequestAdvance = async () => {
        if (!companyId || !network) return;
        if (isRequestingAdvance || !isActive) return;

        const amount = Number(advanceAmount);
        if (isNaN(amount) || amount <= 0 || amount !== Math.floor(amount)) {
            showToast({ type: 'error', title: 'Invalid Amount', message: 'Enter a positive integer for the advance amount (in STX).' });
            return;
        }

        // Enforce max 50% of salary
        const maxAmount = Math.floor(salary / 2_000_000); // salary is in microSTX, user enters STX
        if (amount > maxAmount) {
            showToast({ type: 'error', title: 'Amount Exceeds Limit', message: `You can request up to ${maxAmount} STX (50% of salary).` });
            return;
        }

        // Convert STX to microSTX for the contract
        const microAmount = BigInt(amount) * 1000000n;

        try {
            setIsRequestingAdvance(true);
            await openContractCall({
                network,
                contractAddress: FIXED_CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'request-advance',
                functionArgs: [stringUtf8CV(companyId), uintCV(Number(microAmount))],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [],
                onFinish: (data) => {
                    showToast({
                        type: 'success',
                        title: 'Advance Requested',
                        message: `Advance request tx broadcast (${data.txId.slice(0, 10)}…). Await owner approval.`,
                    });
                    setAdvanceAmount('');
                    setIsRequestingAdvance(false);
                },
                onCancel: () => setIsRequestingAdvance(false),
            });
        } catch (err) {
            console.error('Request advance failed:', err);
            showToast({ type: 'error', title: 'Request Failed', message: 'Could not submit advance request.' });
            setIsRequestingAdvance(false);
        }
    };

    if (!companyId) return <div className="p-10 text-center text-red-500">Invalid Company ID</div>;

    const salary = employeeData?.['salary-per-period'] ?? 0;
    const currentPeriod = periodInfo?.['period-number'] ?? periodInfo?.['current-period'] ?? 0;
    const isActive = employeeData?.['is-active'] ?? false;
    const totalEarned = employeeStats?.['total-salary-earned'] ?? 0;
    const totalClaimed = employeeData?.['total-claimed'] ?? 0;
    const advanceDebt = employeeStats?.['current-advance-debt'] ?? 0;
    const periodsClaimed = employeeStats?.['periods-claimed'] ?? 0;
    const claimDisabled = claimStatus === 'claimed' || claimStatus === 'broadcast' || !isActive || isPending;
    const advanceDisabled = isRequestingAdvance || !isActive;

    return (
        <div className="min-h-screen bg-black text-white pt-[88px]">
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-display font-bold mb-1">
                    {companyData ? companyData.name : 'Loading...'}
                </h1>
                <p className="text-gray-400">
                    Employee Dashboard · <span className="font-mono text-white text-sm">{userAddress?.slice(0, 8)}…{userAddress?.slice(-4)}</span>
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <div className="text-red-400 mt-0.5">⚠️</div>
                    <div>
                        <div className="font-bold text-red-400 mb-1">Failed to Load Data</div>
                        <div className="text-sm text-red-200/80">{error}</div>
                        <button
                            onClick={fetchData}
                            className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Employee not found */}
            {!loading && !error && !employeeData && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-4 text-red-400">
                        <Icons.X className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Not an Employee</h3>
                    <p className="text-gray-400">Your connected wallet is not registered as an employee for this organization.</p>
                </div>
            )}

            {/* Dashboard content */}
            {(loading || employeeData) && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <Card className="p-6">
                            <div className="text-gray-400 text-sm mb-2">Your Salary</div>
                            <div className="text-3xl font-bold font-mono">
                                {loading ? '...' : formatSTX(salary)} <span className="text-lg text-kinetic-purple">STX</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">per period</div>
                        </Card>
                        <Card className="p-6">
                            <div className="text-gray-400 text-sm mb-2">Current Period</div>
                            <div className="text-3xl font-bold">
                                {loading ? '...' : `#${currentPeriod}`}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {claimStatus === 'claimed' ? '✅ Claimed' : claimStatus === 'broadcast' ? '📡 Pending…' : claimStatus === 'loading' ? '…' : '⏳ Unclaimed'}
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="text-gray-400 text-sm mb-2">Total Claimed</div>
                            <div className="text-3xl font-bold font-mono">
                                {loading ? '...' : formatSTX(totalClaimed)} <span className="text-lg text-gray-500">STX</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{periodsClaimed} period{periodsClaimed !== 1 ? 's' : ''}</div>
                        </Card>
                        <Card className="p-6">
                            <div className="text-gray-400 text-sm mb-2">Status</div>
                            <div className="text-xl font-bold flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                {loading ? '...' : isActive ? 'Active' : 'Inactive'}
                            </div>
                            {advanceDebt > 0 && (
                                <div className="text-xs text-yellow-400 mt-1">Advance debt: {formatSTX(advanceDebt)} STX</div>
                            )}
                        </Card>
                    </div>

                    {/* Claim Salary */}
                    <Card className="p-8 mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Claim Salary</h2>
                                <p className="text-gray-400">
                                    {claimStatus === 'claimed'
                                        ? 'You have already claimed your salary for this period.'
                                        : claimStatus === 'broadcast'
                                        ? 'Your claim has been broadcast. Waiting for on-chain confirmation…'
                                        : `Claim ${formatSTX(salary)} STX for period #${currentPeriod}.`}
                                    {advanceDebt > 0 && claimStatus !== 'claimed' && claimStatus !== 'broadcast' && (
                                        <span className="text-yellow-400"> (minus {formatSTX(advanceDebt)} STX advance debt)</span>
                                    )}
                                </p>
                            </div>
                            <MagneticButton
                                onClick={handleClaimSalary}
                                disabled={claimDisabled}
                                className={`px-8 py-4 rounded-xl font-bold text-lg shrink-0 ${
                                    claimDisabled
                                        ? 'bg-white/10 text-gray-500'
                                        : 'bg-kinetic-purple text-white hover:shadow-[0_0_30px_rgba(138,43,226,0.4)]'
                                } transition-all`}
                            >
                                {isPending ? 'Broadcasting…' : claimStatus === 'broadcast' ? '📡 Pending…' : claimStatus === 'claimed' ? '✓ Claimed' : 'Claim Salary'}
                            </MagneticButton>
                        </div>
                    </Card>

                    {/* Request Advance */}
                    <Card className="p-8 mb-8">
                        <h2 className="text-2xl font-bold mb-2">Request Advance</h2>
                        <p className="text-gray-400 mb-4">
                            Request up to 50% of your salary as an advance. Your employer must approve the request.
                        </p>
                        <div className="flex gap-3 max-w-lg">
                            <input
                                type="number"
                                value={advanceAmount}
                                onChange={e => setAdvanceAmount(e.target.value)}
                                placeholder={`Max ${formatSTX(Math.floor(salary / 2))} STX`}
                                disabled={advanceDisabled}
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-kinetic-purple outline-none transition-colors disabled:opacity-50"
                            />
                            <MagneticButton
                                onClick={handleRequestAdvance}
                                disabled={advanceDisabled}
                                className={`px-6 py-3 rounded-xl font-bold shrink-0 ${
                                    advanceDisabled
                                        ? 'bg-white/10 text-gray-500'
                                        : 'bg-white text-black'
                                } transition-all`}
                            >
                                {isRequestingAdvance ? 'Sending…' : 'Request'}
                            </MagneticButton>
                        </div>
                    </Card>

                    {/* Earnings Summary */}
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold mb-6">Earnings Summary</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Total Earned</div>
                                <div className="font-mono font-bold text-lg">{formatSTX(totalEarned)} STX</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Total Claimed</div>
                                <div className="font-mono font-bold text-lg">{formatSTX(totalClaimed)} STX</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Periods Claimed</div>
                                <div className="font-mono font-bold text-lg">{periodsClaimed}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Advance Debt</div>
                                <div className={`font-mono font-bold text-lg ${advanceDebt > 0 ? 'text-yellow-400' : ''}`}>
                                    {formatSTX(advanceDebt)} STX
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}
            </div>
        </div>
    );
};

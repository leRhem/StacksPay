import { useState } from 'react';
import { Modal } from './Modal';
import { MagneticButton } from '../MagneticButton';
import { useStacksConnect } from '../../hook/useStacksConnect';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, uintCV, standardPrincipalCV, PostConditionMode, someCV, noneCV } from '@stacks/transactions';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../../consts';
import { useToast } from '../../context/ToastContext';

interface AddBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId: string;
    employeeAddresses: string[];
}

export const AddBonusModal = ({ isOpen, onClose, companyId, employeeAddresses }: AddBonusModalProps) => {
    const { network } = useStacksConnect();
    const showToast = useToast();
    const [selectedAddress, setSelectedAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async () => {
        if (!selectedAddress || !amount) return;

        const amountNum = parseInt(amount, 10);
        if (isNaN(amountNum) || amountNum <= 0) {
            showToast({ type: 'error', title: 'Invalid Amount', message: 'Bonus amount must be a positive integer.' });
            return;
        }

        try {
            setIsPending(true);

            await openContractCall({
                network,
                contractAddress: FIXED_CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'add-bonus',
                functionArgs: [
                    stringUtf8CV(companyId),
                    standardPrincipalCV(selectedAddress),
                    uintCV(amountNum),
                    notes.trim() ? someCV(stringUtf8CV(notes.trim())) : noneCV(),
                ],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [],
                onFinish: (data) => {
                    showToast({
                        type: 'success',
                        title: 'Bonus Added',
                        message: `Bonus tx broadcast (${data.txId.slice(0, 10)}…). Employee can claim after confirmation.`,
                    });
                    resetForm();
                    onClose();
                },
                onCancel: () => {
                    setIsPending(false);
                },
            });
        } catch (err) {
            console.error('Add bonus failed:', err);
            showToast({ type: 'error', title: 'Transaction Failed', message: 'Could not add bonus.' });
            setIsPending(false);
        }
    };

    const resetForm = () => {
        setSelectedAddress('');
        setAmount('');
        setNotes('');
        setIsPending(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} title="Add Employee Bonus">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Employee</label>
                    <select
                        value={selectedAddress}
                        onChange={e => setSelectedAddress(e.target.value)}
                        disabled={isPending}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors font-mono text-sm"
                    >
                        <option value="">Select an employee…</option>
                        {employeeAddresses.map(addr => (
                            <option key={addr} value={addr}>{addr.slice(0, 10)}…{addr.slice(-6)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Bonus Amount (microSTX)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="e.g. 500000000"
                        disabled={isPending}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors font-mono"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
                    <input
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="e.g. Q4 performance bonus"
                        disabled={isPending}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                    />
                </div>
                <MagneticButton
                    onClick={handleSubmit}
                    disabled={isPending}
                    className={`w-full py-4 bg-kinetic-purple rounded-xl font-bold mt-4 ${isPending ? 'opacity-50' : ''}`}
                >
                    {isPending ? 'Broadcasting…' : 'Add Bonus'}
                </MagneticButton>
            </div>
        </Modal>
    );
};

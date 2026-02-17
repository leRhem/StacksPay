import { useState } from 'react';
import { Modal } from './Modal';
import { MagneticButton } from '../MagneticButton';
import { useStacksConnect } from '../../hook/useStacksConnect';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, uintCV, standardPrincipalCV, PostConditionMode } from '@stacks/transactions';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../../consts';
import { useToast } from '../../context/ToastContext';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: (addedAddress?: string) => void;
    companyId: string;
}

export const AddEmployeeModal = ({ isOpen, onClose, companyId }: AddEmployeeModalProps) => {
    const { network } = useStacksConnect();
    const showToast = useToast();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [salary, setSalary] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async () => {
        if (!address || !name || !salary) return;
        
        // Validate salary: reject decimals, NaN, and non-positive values
        const salaryNum = Number(salary);
        if (isNaN(salaryNum) || salaryNum <= 0 || salaryNum !== Math.floor(salaryNum)) {
            showToast({ type: 'error', title: 'Invalid Salary', message: 'Salary must be a positive integer.' });
            return;
        }

        try {
            setIsPending(true);
            await openContractCall({
                network,
                contractAddress: FIXED_CONTRACT_ADDRESS || 'ST1M9HB8FHTGZ0TA84TNW6MP9H8P39AYK13H3C9J1',
                contractName: CONTRACT_NAME,   
                functionName: 'add-employee',
                functionArgs: [
                    stringUtf8CV(companyId),
                    standardPrincipalCV(address),
                    stringUtf8CV(name),
                    uintCV(salaryNum)
                ],
                postConditionMode: PostConditionMode.Deny,
                postConditions: [],
                onFinish: (data) => {
                    const broadcastTxId = data.txId;
                    console.log('Transaction broadcast:', broadcastTxId);
                    showToast({
                        type: 'success',
                        title: 'Transaction Broadcast',
                        message: `Add employee tx submitted (${broadcastTxId.slice(0, 10)}…). It will appear after confirmation.`,
                    });
                    // Reset form before closing to avoid state updates after unmount
                    resetForm();
                    onClose(address);
                },
                onCancel: () => {
                    console.log('User cancelled employee registration');
                    setIsPending(false);
                }
            });
        } catch (error) {
            console.error('Add employee initiation failed:', error);
            showToast({ type: 'error', title: 'Transaction Failed', message: 'Could not initiate add-employee transaction.' });
            setIsPending(false);
        }
    };

    const resetForm = () => {
        setName('');
        setAddress('');
        setSalary('');
        setIsPending(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} title="Add New Employee">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <input 
                        value={name} onChange={e => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                        placeholder="e.g. Alice Bob"
                        disabled={isPending}
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Stacks Address</label>
                    <input 
                        value={address} onChange={e => setAddress(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors font-mono text-sm"
                        placeholder="ST..."
                        disabled={isPending}
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Salary (STX per period)</label>
                    <input 
                        type="number"
                        value={salary} onChange={e => setSalary(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                        placeholder="1000"
                        disabled={isPending}
                    />
                </div>

                <MagneticButton 
                    onClick={handleSubmit} 
                    disabled={isPending}
                    className={`w-full py-4 bg-kinetic-purple rounded-xl font-bold mt-4 ${isPending ? 'opacity-50' : ''}`}
                >
                    {isPending ? 'Broadcasting…' : 'Confirm & Sign Transaction'}
                </MagneticButton>
            </div>
        </Modal>
    );
};

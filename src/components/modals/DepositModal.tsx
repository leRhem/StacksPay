import { useState } from 'react';
import { Modal } from './Modal';
import { MagneticButton } from '../MagneticButton';
import { useStacksConnect } from '../../hook/useStacksConnect';
import { openContractCall } from '@stacks/connect';
import { uintCV, stringUtf8CV, PostConditionMode } from '@stacks/transactions';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../../consts';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId?: string;
}

export const DepositModal = ({ isOpen, onClose, companyId }: DepositModalProps) => {
    const { network } = useStacksConnect();
    const [amount, setAmount] = useState('');

    const handleSubmit = async () => {
        if (!amount || !companyId) return;

        try {
            await openContractCall({
                network,
                contractAddress: FIXED_CONTRACT_ADDRESS || 'ST1M9HB8FHTGZ0TA84TNW6MP9H8P39AYK13H3C9J1',
                contractName: CONTRACT_NAME,
                functionName: 'fund-payroll',
                functionArgs: [
                    stringUtf8CV(companyId),
                    uintCV(Number(amount) * 1000000) // Convert to uSTX (assuming 6 decimals)
                ],
                postConditionMode: PostConditionMode.Allow,
                onFinish: (data) => {
                    console.log('Transaction:', data);
                    onClose();
                },
                onCancel: () => {
                    console.log('User cancelled deposit');
                }
            });
        } catch (error) {
            console.error('Deposit initiation failed:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Deposit to ${companyId}`}>
            <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-500 text-sm mb-4">
                    Funds will be deposited to <strong>{companyId}</strong> vault.
                </div>
                
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Amount (STX)</label>
                    <input 
                        type="number"
                        value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                        placeholder="0.00"
                    />
                </div>
                
                <MagneticButton onClick={handleSubmit} className="w-full py-4 bg-white text-black rounded-xl font-bold mt-4">
                    Deposit Funds
                </MagneticButton>
            </div>
        </Modal>
    );
};

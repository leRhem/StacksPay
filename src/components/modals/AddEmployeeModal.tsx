import React, { useState } from 'react';
import { Modal } from './Modal';
import { MagneticButton } from '../MagneticButton';
import { useStacksConnect } from '../../hook/useStacksConnect';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, uintCV, standardPrincipalCV, PostConditionMode } from '@stacks/transactions';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../../consts';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId: string;
}

export const AddEmployeeModal = ({ isOpen, onClose, companyId }: AddEmployeeModalProps) => {
    const { network } = useStacksConnect();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [salary, setSalary] = useState('');

    const handleSubmit = async () => {
        if (!address || !name || !salary) return;
        
        await openContractCall({
            network,
            contractAddress: FIXED_CONTRACT_ADDRESS || 'ST1M9HB8FHTGZ0TA84TNW6MP9H8P39AYK13H3C9J1',
            contractName: CONTRACT_NAME,   
            functionName: 'add-employee',
            functionArgs: [
                stringUtf8CV(companyId),
                standardPrincipalCV(address),
                stringUtf8CV(name),
                uintCV(Number(salary))
            ],
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data) => {
                console.log('Transaction:', data);
                onClose();
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <input 
                        value={name} onChange={e => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                        placeholder="e.g. Alice Bob"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Stacks Address</label>
                    <input 
                        value={address} onChange={e => setAddress(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors font-mono text-sm"
                        placeholder="ST..."
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Salary (STX per period)</label>
                    <input 
                        type="number"
                        value={salary} onChange={e => setSalary(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                        placeholder="1000"
                    />
                </div>
                
                <MagneticButton onClick={handleSubmit} className="w-full py-4 bg-kinetic-purple rounded-xl font-bold mt-4">
                    Confirm & Sign Transaction
                </MagneticButton>
            </div>
        </Modal>
    );
};

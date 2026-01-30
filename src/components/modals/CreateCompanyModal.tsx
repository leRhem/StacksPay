import React, { useState } from 'react';
import { Modal } from './Modal';
import { MagneticButton } from '../MagneticButton';
import { useStacksConnect } from '../../hook/useStacksConnect';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, uintCV, noneCV, PostConditionMode } from '@stacks/transactions';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../../consts';

interface CreateCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateCompanyModal = ({ isOpen, onClose }: CreateCompanyModalProps) => {
    const { network } = useStacksConnect();
    const [name, setName] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [payDay, setPayDay] = useState('1');
    const [frequency, setFrequency] = useState('3'); // Default to monthly (3)

    const handleSubmit = async () => {
        if (!name || !companyId) return;

        await openContractCall({
            network,
            contractAddress: FIXED_CONTRACT_ADDRESS || 'ST1M9HB8FHTGZ0TA84TNW6MP9H8P39AYK13H3C9J1',
            contractName: CONTRACT_NAME,
            functionName: 'create-company',
            functionArgs: [
                stringUtf8CV(companyId),
                stringUtf8CV(name),
                noneCV(), // Description (optional)
                uintCV(Number(frequency)),
                uintCV(Number(payDay))
            ],
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data) => {
                console.log('Transaction:', data);
                
                // Persist to local storage for "My Companies" list
                const saved = localStorage.getItem('stackspay_companies');
                const companies = saved ? JSON.parse(saved) : [];
                companies.push({ id: companyId, name: name });
                localStorage.setItem('stackspay_companies', JSON.stringify(companies));

                onClose();
                // We'll let the user see the success or redirect. 
                // For better UX, let's refresh or navigation happens in parent? 
                // Actually, just closing and letting them see it in the list (or auto navigating) is good.
                window.location.href = `/companies/${companyId}`;
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register Organization">
            <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-4">Initialize your payroll smart contract on Stacks.</p>
                
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                    <input 
                        value={name} onChange={e => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                        placeholder="Acme Corp"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Company ID (Unique)</label>
                    <input 
                        value={companyId} onChange={e => setCompanyId(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors font-mono text-sm"
                        placeholder="acme-dao"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Pay Frequency</label>
                        <select 
                            value={frequency} onChange={e => setFrequency(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors appearance-none"
                        >
                            <option value="1">Weekly</option>
                            <option value="2">Bi-Weekly</option>
                            <option value="3">Monthly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Pay Day (1-31)</label>
                        <input 
                           type="number" min="1" max="31"
                           value={payDay} onChange={e => setPayDay(e.target.value)}
                           className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-kinetic-purple outline-none transition-colors"
                        />
                    </div>
                </div>

                <MagneticButton onClick={handleSubmit} className="w-full py-4 bg-kinetic-purple rounded-xl font-bold mt-4">
                    Initialize Smart Contract
                </MagneticButton>
            </div>
        </Modal>
    );
};

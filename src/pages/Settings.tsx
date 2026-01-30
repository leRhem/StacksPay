import React, { useState } from 'react';
import { Card } from '../components/Card';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useStacks } from '../components/StacksProvider';
import { CONTRACT_NAME, FIXED_CONTRACT_ADDRESS } from '../consts';

export const Settings = () => {
    const { isMainnet, setNetwork, network } = useStacks();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-display font-bold mb-8">Settings</h1>
                
                <div className="space-y-6">
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold mb-6">Network Configuration</h2>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <h3 className="font-bold">Network</h3>
                                <p className="text-sm text-gray-400">Toggle between Mainnet and Testnet</p>
                            </div>
                            <button 
                                onClick={() => setNetwork(isMainnet ? 'testnet' : 'mainnet')}
                                className={`px-4 py-2 rounded-lg font-bold transition-colors ${isMainnet ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}
                            >
                                {isMainnet ? 'Mainnet' : 'Testnet'}
                            </button>
                        </div>
                    </Card>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h3 className="font-bold mb-2">Contract Info</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400 block">Address</span>
                                    <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">{FIXED_CONTRACT_ADDRESS}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Name</span>
                                    <span>{CONTRACT_NAME}</span>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </DashboardLayout>
    );
};


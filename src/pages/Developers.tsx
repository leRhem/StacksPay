import React from 'react';
import { Icons } from '../components/Icons';

export const Developers = () => {
    return (
        <div className="pt-32 pb-20 min-h-screen bg-black text-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto mb-20 text-center">
                    <div className="inline-block px-4 py-2 rounded-full bg-kinetic-orange/10 border border-kinetic-orange/20 text-kinetic-orange font-mono text-sm mb-6">
                         $ npm install @stackspay/sdk
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">
                        Built for <span className="text-kinetic-purple">Builders</span>.
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Integrate crypto payroll into your DAO or dApp with just a few lines of code. Fully typed, extensive documentation.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-[#111] p-8 rounded-2xl border border-white/5 font-mono text-sm overflow-x-auto">
                        <pre className="text-gray-300">
{`// Initialize StacksPay
import { StacksPay } from '@stackspay/sdk';

const payroll = new StacksPay({
  network: 'mainnet',
  apiKey: process.env.STACKS_KEY
});

// Stream payment
await payroll.createStream({
  recipient: 'SP2J6ZS...',
  amount: 5000, 
  token: 'STX',
  duration: '30d'
});`}
                        </pre>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-[#111] p-8 rounded-2xl border border-white/5 flex gap-4">
                            <div className="text-kinetic-orange"><Icons.Code /></div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Webhooks & Events</h3>
                                <p className="text-gray-400">Listen for payment completions, failed transactions, and new employee onboardings.</p>
                            </div>
                        </div>
                        <div className="bg-[#111] p-8 rounded-2xl border border-white/5 flex gap-4">
                            <div className="text-kinetic-orange"><Icons.Layers /></div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Clarinet Compatible</h3>
                                <p className="text-gray-400">Test your integrations locally with our comprehensive Clarinet mock environment.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

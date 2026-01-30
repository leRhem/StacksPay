import React from 'react';
import { MagneticButton } from '../components/MagneticButton';
import { Icons } from '../components/Icons';
import { Card } from '../components/Card';

export const Pricing = () => {
    return (
        <div className="pt-32 pb-20 min-h-screen bg-black text-white">
            <div className="container mx-auto px-6">
                <h1 className="text-5xl md:text-7xl font-display font-bold mb-20 text-center">
                    Simple <span className="text-kinetic-purple">Pricing</span>.
                </h1>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter */}
                    <Card className="p-10 flex flex-col">
                        <div className="text-gray-400 font-mono mb-4">STARTER</div>
                        <div className="text-5xl font-bold mb-6">Free</div>
                        <p className="text-gray-400 mb-8">Perfect for small DAOs and startups just getting started.</p>
                        <ul className="space-y-4 mb-auto text-gray-300">
                             <li className="flex gap-3"><Icons.ArrowRight /> Up to 5 employees</li>
                             <li className="flex gap-3"><Icons.ArrowRight /> STX payments only</li>
                             <li className="flex gap-3"><Icons.ArrowRight /> Basic reporting</li>
                        </ul>
                        <MagneticButton className="w-full py-4 mt-8 bg-white/10 rounded-full font-bold hover:bg-white text-white hover:text-black transition-colors">Start Free</MagneticButton>
                    </Card>

                    {/* Pro */}
                    <Card className="p-10 relative flex flex-col transform md:-translate-y-4 shadow-[0_0_50px_rgba(139,92,246,0.2)] bg-white/5 border-kinetic-purple">
                         <div className="absolute top-0 right-0 bg-kinetic-purple text-white px-4 py-1 rounded-bl-xl rounded-tr-2xl text-xs font-bold tracking-wider">POPULAR</div>
                        <div className="text-kinetic-purple font-mono mb-4">GROWTH</div>
                        <div className="text-5xl font-bold mb-6">$49<span className="text-xl text-gray-400 font-normal">/mo</span></div>
                        <p className="text-gray-300 mb-8">For growing teams that need automation and compliance.</p>
                         <ul className="space-y-4 mb-auto text-white">
                             <li className="flex gap-3"><Icons.ArrowRight /> Up to 50 employees</li>
                             <li className="flex gap-3"><Icons.ArrowRight /> Multi-asset (BTC, SIP-10)</li>
                             <li className="flex gap-3"><Icons.ArrowRight /> Tax withholding</li>
                             <li className="flex gap-3"><Icons.ArrowRight /> Priority Support</li>
                        </ul>
                        <MagneticButton className="w-full py-4 mt-8 bg-kinetic-purple rounded-full font-bold">Get Started</MagneticButton>
                    </Card>

                    {/* Enterprise */}
                    <Card className="p-10 flex flex-col">
                        <div className="text-gray-400 font-mono mb-4">ENTERPRISE</div>
                        <div className="text-5xl font-bold mb-6">Custom</div>
                        <p className="text-gray-400 mb-8">For large organizations requiring custom contracts and audits.</p>
                        <ul className="space-y-4 mb-auto text-gray-300">
                             <li className="flex gap-3"><Icons.ArrowRight /> Unlimited employees</li>
                             <li className="flex gap-3"><Icons.ArrowRight /> Custom smart contracts</li>
                             <li className="flex gap-3"><Icons.ArrowRight /> Dedicated account manager</li>
                             <li className="flex gap-3"><Icons.ArrowRight /> API Access</li>
                        </ul>
                        <MagneticButton className="w-full py-4 mt-8 bg-white/10 rounded-full font-bold hover:bg-white text-white hover:text-black transition-colors">Contact Sales</MagneticButton>
                    </Card>
                </div>
            </div>
        </div>
    );
};

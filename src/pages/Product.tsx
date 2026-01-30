import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MagneticButton } from '../components/MagneticButton';
import { Icons } from '../components/Icons';

export const Product = () => {
    const containerRef = useRef(null);
    
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".product-feature", {
                y: 50,
                opacity: 0,
                stagger: 0.2,
                duration: 1,
                ease: "power3.out",
                delay: 0.5
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const productFeatures = [
        {
            title: "Global Payroll",
            desc: "Pay contractors and employees in 150+ countries using STX or stablecoins. Compliance handled automatically.",
            icon: <Icons.Globe />
        },
        {
            title: "Streaming Salaries",
            desc: "Why wait two weeks? Stream salary second-by-second. Allow employees to withdraw whenever they want.",
            icon: <Icons.Zap />
        },
        {
            title: "Tax Automation",
            desc: "Automatically calculate and withhold taxes based on jurisdictions. Export reports in one click.",
            icon: <Icons.TrendingUp />
        }
    ];

    return (
        <div ref={containerRef} className="pt-32 pb-20 min-h-screen bg-black text-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <h1 className="text-5xl md:text-8xl font-display font-bold mb-8">
                        The <span className="text-kinetic-purple">Future</span> of Compensation
                    </h1>
                    <p className="text-xl text-gray-400">
                        StacksPay is more than a payroll tool. It's a completely new economic operating system for the crypto-native workforce.
                    </p>
                </div>

                <div className="grid md:grid-cols-1 gap-12 mb-32">
                    {productFeatures.map((feature, i) => (
                        <div key={i} className="product-feature flex flex-col md:flex-row items-center gap-12 bg-[#111] border border-white/5 p-12 rounded-3xl group hover:border-kinetic-orange/30 transition-colors">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-kinetic-orange group-hover:scale-110 transition-transform duration-500 shrink-0">
                                {feature.icon}
                            </div>
                            <div className="text-left">
                                <h3 className="text-4xl font-display font-bold mb-4">{feature.title}</h3>
                                <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-8">Ready to modernize your payroll?</h2>
                    <MagneticButton className="px-12 py-5 bg-white text-black rounded-full font-bold text-lg">
                        Get Demo
                    </MagneticButton>
                </div>
            </div>
        </div>
    );
};

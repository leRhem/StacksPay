import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Icons } from './Icons';
import { Card } from './Card';

gsap.registerPlugin(ScrollTrigger);

export const Features = () => {
    const gridRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".feature-card", 
                { opacity: 0, y: 50 },
                {
                    opacity: 1, 
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        // markers: true,
                        start: "top 85%", // Trigger slightly earlier
                    }
                }
            );
        }, gridRef);
        return () => ctx.revert();
    }, []);

    const features = [
        { title: "On-Chain Transparency", desc: "Every payment is verifiable on the Stacks blockchain." },
        { title: "Smart Scheduling", desc: "Set it and forget it. Streaming payments or monthly." },
        { title: "Multi-Asset Support", desc: "Pay in STX, xBTC, or any SIP-10 token." },
        { title: "Global Compliance", desc: "Built-in tools for tax reporting and KYC." },
        { title: "Self-Custody", desc: "We never hold your funds. It's all in the contract." },
        { title: "Instant Settlement", desc: "No banking hours. No holidays. 24/7/365." },
    ];

    return (
        <section id="features" className="py-32 bg-black relative">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl md:text-7xl font-display font-bold mb-20 text-center">Built for <span className="kinetic-text">Crypto Natives</span></h2>
                <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <Card key={i} className="feature-card h-80 p-10 flex flex-col justify-end group">
                            <div className="mb-auto text-kinetic-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                <Icons.Layers />
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-3">{f.title}</h3>
                            <p className="text-gray-400">{f.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );

}

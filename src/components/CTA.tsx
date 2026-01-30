import { useRef } from 'react';
import { MagneticButton } from './MagneticButton';

export const CTA = () => {
    const containerRef = useRef(null);

    return (
        <section id="pricing" ref={containerRef} className="min-h-screen bg-kinetic-purple flex items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            
            <div className="relative z-10 px-6">
                <h2 className="text-white text-6xl md:text-9xl font-display font-bold mb-8 text-black tracking-tighter mix-blend-color-dodge">
                    Ready to Stream?
                </h2>
                <p className="text-2xl md:text-3xl text-white/80 mb-12 max-w-2xl mx-auto">
                    Stop living in the banking stone age. Upgrade your organization.
                </p>
                <div className="flex justify-center scale-125">
                     <MagneticButton className="px-12 py-6 bg-black text-white rounded-full font-bold text-xl hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-shadow duration-500">
                        Launch Dashboard
                     </MagneticButton>
                </div>
            </div>
        </section>
    );
}

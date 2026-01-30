import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card } from './Card';

gsap.registerPlugin(ScrollTrigger);

export const Solution = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
        // ... existing useEffect code is fine, but context management creates scope
      const ctx = gsap.context(() => {
        const sections = gsap.utils.toArray(".slide-card");
        
        // Horizontal Scroll
        gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                pin: true,
                scrub: 1,
                end: "+=3000", // Length of scroll
            }
        });

      }, sectionRef);
      return () => ctx.revert();
    }, []);

    return (
        <section id="product" ref={sectionRef} className="h-screen bg-[#0a0a0f] overflow-hidden flex flex-col relative">
            <div className="pt-20 px-10">
                <h2 className="text-4xl font-display text-gray-500">How StacksPay Works</h2>
            </div>
            <div className="flex-1 flex items-center pl-20 overflow-hidden">
                <div className="flex gap-20" ref={trackRef}>
                     {[
                         { step: "01", title: "Create Company", desc: "Connect HiRo wallet and initialize your organization smart contract." },
                         { step: "02", title: "Add Team", desc: "Invite members via email or wallet address. Set pay rates in STX or USD." },
                         { step: "03", title: "Fund & Automate", desc: "Deposit STX into the vault. The protocol handles the rest on block time." },
                         { step: "04", title: "Real-Time Claims", desc: "Employees claim accrued salary instantly, second by second." }
                     ].map((item, idx) => (
                         <Card key={idx} className="slide-card w-[80vw] md:w-[60vw] h-[60vh] flex-shrink-0 p-12 flex flex-col justify-between group hover:bg-white/10 transition-colors duration-500">
                             <div className="absolute top-0 right-0 p-20 opacity-10 font-bold text-[300px] leading-none select-none text-white pointer-events-none translate-x-1/3 -translate-y-1/3">
                                 {item.step}
                             </div>
                             <div className="relative z-10">
                                 <div className="text-kinetic-purple font-mono mb-4 text-xl">STEP {item.step}</div>
                                 <h3 className="text-6xl md:text-7xl font-display font-bold mb-8 max-w-2xl">{item.title}</h3>
                             </div>
                             <div className="relative z-10">
                                 <p className="text-2xl text-gray-300 max-w-xl">{item.desc}</p>
                             </div>
                         </Card>
                     ))}
                </div>
            </div>
        </section>
    )
}

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Icons } from './Icons';
import { MagneticButton } from './MagneticButton';

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background Gradient Animation
      gsap.to(".gradient-mesh", {
        backgroundPosition: "200% center",
        duration: 15,
        repeat: -1,
        ease: "none"
      });

      // Text Stagger
      const words = textRef.current?.querySelectorAll(".word");
      if (words) {
         gsap.from(words, {
          y: 100,
          opacity: 0,
          rotationX: -45,
          stagger: 0.1,
          duration: 1.2,
          ease: "power4.out",
          delay: 0.5
        });
      }
      
      // Visual Float
      gsap.to(visualRef.current, {
        y: -30,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
      
      // Parallax on Scroll
      gsap.to(containerRef.current, {
        scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: 100,
        opacity: 0.5
      });
      
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="start" ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="gradient-mesh absolute inset-0 bg-gradient-kinetic opacity-10 blur-[100px] bg-[length:200%_200%] pointer-events-none" />
      
      <div className="container relative z-10 px-6 mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div ref={textRef} className="text-left space-y-8">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono tracking-wider text-kinetic-orange mb-4">
             // POWERED BY STACKS
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter">
            <span className="word block">Blockchain</span>
            <span className="word block text-transparent bg-clip-text bg-gradient-to-r from-kinetic-purple to-kinetic-orange">Payroll.</span>
            <span className="word block">Zero Friction.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-body max-w-lg leading-relaxed opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards]">
            Pay your team in STX. Automated, transparent, and unstoppable. 
            The future of work is crypto-native.
          </p>
          <div className="flex gap-6 pt-4 opacity-0 animate-[fadeIn_1s_ease-out_1.8s_forwards]">
             <MagneticButton className="px-10 py-5 bg-[#ffffff] text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300">
                Start Paying <Icons.ArrowRight />
             </MagneticButton>
             <a href="#product" className="px-10 py-5 border border-white/20 rounded-full font-bold text-lg hover:border-white transition-colors duration-300 flex items-center gap-2">
                <Icons.Zap /> See How
             </a>
          </div>
        </div>

        <div ref={visualRef} className="relative h-[600px] hidden md:block select-none pointer-events-none">
          {/* Abstract Visual Representation of Money Flow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-kinetic rounded-full opacity-20 blur-[80px]" />
          <div className="absolute top-1/4 right-0 w-64 h-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 rotate-6 shadow-2xl">
             <div className="w-full h-8 bg-white/10 rounded-md mb-4" />
             <div className="space-y-3">
                <div className="flex justify-between items-center"><div className="w-1/3 h-4 bg-white/5 rounded-full" /><div className="w-1/4 h-4 bg-green-500/50 rounded-full" /></div>
                <div className="flex justify-between items-center"><div className="w-1/2 h-4 bg-white/5 rounded-full" /><div className="w-1/4 h-4 bg-green-500/50 rounded-full" /></div>
                <div className="flex justify-between items-center"><div className="w-2/3 h-4 bg-white/5 rounded-full" /><div className="w-1/4 h-4 bg-green-500/50 rounded-full" /></div>
             </div>
             <div className="absolute -bottom-10 -left-10 bg-black border border-white/20 p-4 rounded-xl flex items-center gap-4">
               <div className="rounded-full bg-kinetic-orange p-2"><Icons.Bitcoin /></div>
               <div className="text-sm">
                 <div className="text-gray-400">Transaction Sent</div>
                 <div className="font-bold font-mono">2,450 STX</div>
               </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
         <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full animate-[scroll_2s_infinite]" />
         </div>
      </div>
    </section>
  );
};

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers } from 'lucide-react';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// --- ICONS (Inline SVGs to avoid dependencies) ---
const Icons = {
  ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
  Code: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  Bitcoin: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.767 19.089c4.924.868 6.14-6.302 2.767-8.704 5.474-3.737 1.15-8.683-5.597-7.906"></path><path d="M7.767 5.089 12 22"></path><path d="m5 13 14 2"></path></svg>,
  Stacks: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M12 2 L2 12 L12 22 L22 12 Z" /></svg> // Simplified Stacks logo
};

// --- COMPONENTS ---

const MagneticButton = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    
    const mouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    };
    
    const mouseLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    };
    
    btn.addEventListener('mousemove', mouseMove);
    btn.addEventListener('mouseleave', mouseLeave);
    return () => {
      btn.removeEventListener('mousemove', mouseMove);
      btn.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

  return (
    <button ref={btnRef} className={`relative group cursor-pointer ${className}`} onClick={onClick}>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
    </button>
  );
};

const NavBar = () => (
  <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 mix-blend-difference text-white">
    <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/20 backdrop-blur-md rounded-full px-8 py-4 border border-white/10">
      <div className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2">
        <span className="text-kinetic-purple">Stacks</span>Pay
      </div>
      <div className="hidden md:flex gap-8 font-body text-sm font-medium tracking-wide">
        {['Product', 'Developers', 'Company', 'Pricing'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-kinetic-orange transition-colors duration-300">{item}</a>
        ))}
      </div>
      <a href="#start" className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform duration-300">
        Enter App
      </a>
    </div>
  </nav>
);

const Hero = () => {
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
             <a href="#how" className="px-10 py-5 border border-white/20 rounded-full font-bold text-lg hover:border-white transition-colors duration-300 flex items-center gap-2">
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

const Problem = () => {
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
        gsap.from(".pain-point", {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 70%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const points = [
    { icon: <Icons.Shield />, title: "No Transparency", desc: "Traditional payroll is a black box. You verify nothing." },
    { icon: <Icons.Zap />, title: "High Fees", desc: "International wires eat 5-10% of employee salary." },
    { icon: <Icons.Clock />, title: "Slow Processing", desc: "3-5 business days to clear funds. Unacceptable." }
  ];

  return (
    <section ref={sectionRef} className="min-h-[80vh] flex flex-col justify-center py-20 bg-black relative">
       <div className="container mx-auto px-6">
         <div className="mb-20">
           <h2 className="text-5xl md:text-7xl font-display font-bold mb-6">Traditional Payroll <br /><span className="text-red-500">Is Broken.</span></h2>
           <div className="h-1 w-32 bg-red-500" />
         </div>
         
         <div className="grid md:grid-cols-3 gap-8">
            {points.map((p, i) => (
               <div key={i} className="pain-point p-10 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-500 group rounded-none">
                  <div className="text-red-500 mb-6 scale-150 origin-left group-hover:scale-125 transition-transform duration-500">
                     {i === 1 ? <Icons.TrendingUp /> : p.icon} 
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-4">{p.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{p.desc}</p>
               </div>
            ))}
         </div>
       </div>
    </section>
  );
};

const Solution = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
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
                         <div key={idx} className="slide-card w-[80vw] md:w-[60vw] h-[60vh] flex-shrink-0 bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-12 flex flex-col justify-between relative overflow-hidden group hover:bg-white/10 transition-colors duration-500">
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
                         </div>
                     ))}
                </div>
            </div>
        </section>
    )
}

const Features = () => {
    const gridRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".feature-card", {
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 80%",
                },
                y: 50,
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                ease: "power3.out"
            });
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
        <section id="developers" className="py-32 bg-black relative">
            <div className="container mx-auto px-6">
                <h2 className="text-5xl md:text-7xl font-display font-bold mb-20 text-center">Built for <span className="kinetic-text">Crypto Natives</span></h2>
                <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card h-80 bg-[#111] border border-white/5 p-8 flex flex-col justify-end hover:-translate-y-4 hover:border-kinetic-orange/50 transition-all duration-300 group perspective-1000">
                            <div className="mb-auto text-kinetic-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                <Icons.Layers />
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-3">{f.title}</h3>
                            <p className="text-gray-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const Stats = () => {
    const containerRef = useRef(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Count up animation
            gsap.from(".stat-number", {
                textContent: 0,
                duration: 2,
                ease: "power1.out",
                snap: { textContent: 1 },
                stagger: 0.2,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                }
            });

            // Infinite Scroll Carousel
            if (sliderRef.current) {
                const clone = sliderRef.current.innerHTML;
                sliderRef.current.innerHTML += clone; // Duplicate for seamless loop
                
                gsap.to(sliderRef.current, {
                    x: "-50%",
                    duration: 30,
                    ease: "linear",
                    repeat: -1
                });
            }
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const testimonials = [
        { quote: "StacksPay cut our payroll time by 90%.", author: "Alex, Founder @ Gamma" },
        { quote: "Finally, full transparency for my DAO contributors.", author: "Sarah, Lead @ StacksDAO" },
        { quote: "The streaming payments feature is a game changer.", author: "Mike, Dev @ Clarita" },
        { quote: "No more waiting for wires. Truly instant.", author: "Jessica, Contractor" },
    ];

    return (
        <section id="company" ref={containerRef} className="py-20 bg-[#0a0a0f] text-white border-t border-white/10 overflow-hidden">
            <div className="container mx-auto px-6 mb-20 text-center">
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-16">Trusted by <span className="text-kinetic-orange">Crypto Giants</span></h2>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="stat-item">
                        <div className="text-5xl md:text-7xl font-mono font-bold text-kinetic-purple mb-2"><span className="stat-number">500</span>K+</div>
                        <div className="text-gray-400 uppercase tracking-widest text-sm">STX Paid Out</div>
                    </div>
                    <div className="stat-item">
                        <div className="text-5xl md:text-7xl font-mono font-bold text-white mb-2"><span className="stat-number">120</span>+</div>
                        <div className="text-gray-400 uppercase tracking-widest text-sm">Active Companies</div>
                    </div>
                    <div className="stat-item">
                        <div className="text-5xl md:text-7xl font-mono font-bold text-green-500 mb-2"><span className="stat-number">99</span>.9%</div>
                        <div className="text-gray-400 uppercase tracking-widest text-sm">Uptime</div>
                    </div>
                </div>
            </div>

            {/* Carousel */}
            <div className="relative w-full overflow-hidden py-10">
                <div ref={sliderRef} className="flex gap-10 w-max">
                    {testimonials.map((t, i) => (
                        <div key={i} className="w-[300px] md:w-[400px] bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shrink-0">
                            <p className="text-xl italic text-gray-300 mb-6">"{t.quote}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kinetic-purple to-kinetic-orange" />
                                <div className="font-bold text-sm tracking-wide">{t.author}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
            </div>
        </section>
    );
}

const CTA = () => {
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

export default function App() {
  return (
    <div className="font-body bg-background text-foreground overflow-x-hidden">
      <NavBar />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <Stats />
      <CTA />
      
      <footer className="bg-black py-12 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>© 2024 StacksPay. Built on Bitcoin.</p>
      </footer>
    </div>
  );
}

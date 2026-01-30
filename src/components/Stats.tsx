import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Stats = () => {
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

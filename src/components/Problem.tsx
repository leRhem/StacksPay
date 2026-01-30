import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Icons } from './Icons';
import { Card } from './Card';

gsap.registerPlugin(ScrollTrigger);

export const Problem = () => {
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
               <Card key={i} className="pain-point p-10 hover:border-red-500/50 hover:bg-red-500/5 group rounded-3xl" hoverEffect={false}>
                  <div className="text-red-500 mb-6 scale-150 origin-left group-hover:scale-125 transition-transform duration-500">
                     {i === 1 ? <Icons.TrendingUp /> : p.icon} 
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-4">{p.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{p.desc}</p>
               </Card>
            ))}
         </div>
       </div>
    </section>
  );
};

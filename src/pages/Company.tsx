import { Stats } from '../components/Stats';

export const Company = () => {
    return (
        <div className="pt-32 pb-20 min-h-screen bg-black text-white">
            <div className="container mx-auto px-6 text-center mb-24">
                <h1 className="text-5xl md:text-7xl font-display font-bold mb-12">
                    We Are <span className="text-kinetic-orange">Global</span>.
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    StacksPay was founded on a simple belief: <b className="text-white">Financial rails should be open, transparent, and programmable.</b> 
                    We are a distributed team of engineers, designers, and crypto-economists building the future of work on Bitcoin.
                </p>
            </div>
            
            <Stats />

            <div className="container mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl font-bold mb-12">Backed By</h2>
                <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="text-2xl font-display font-bold">Y Combinator</div>
                    <div className="text-2xl font-display font-bold">Stacks Foundation</div>
                    <div className="text-2xl font-display font-bold">Coinbase Ventures</div>
                    <div className="text-2xl font-display font-bold">Placeholder</div>
                </div>
            </div>
        </div>
    );
};

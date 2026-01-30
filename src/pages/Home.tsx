import React from 'react';
import { Hero } from '../components/Hero';
import { Problem } from '../components/Problem';
import { Solution } from '../components/Solution';
import { Features } from '../components/Features';
import { Stats } from '../components/Stats';
import { CTA } from '../components/CTA';

export const Home = () => {
    return (
        <main>
            <Hero />
            <Problem />
            <Solution />
            <Features />
            <Stats />
            <CTA />
        </main>
    );
};

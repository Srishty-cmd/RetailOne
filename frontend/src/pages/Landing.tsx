import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Metrics from '../components/Metrics';
import Features from '../components/Features';
import DashboardShowcase from '../components/DashboardShowcase';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-text-main antialiased selection:bg-primary-light selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <Metrics />
        <Features />
        <DashboardShowcase />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;

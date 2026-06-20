import { ArrowRight, Calendar, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-primary-hover to-primary text-white py-16 px-6 sm:px-12 lg:px-20 text-center shadow-xl">
          {/* Decorative Background Circles */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-white/5 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 h-64 w-64 rounded-full bg-white/5 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Soft Icon Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Empowering 10,000+ Retail Stores
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Ready to Modernize Your <br className="hidden sm:inline" />
              Retail Operations?
            </h2>
            
            <p className="text-white/80 mt-6 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
              Experience the power of real-time inventory sync, intuitive sales tracking, and lightning-fast retail register software. Setup in minutes.
            </p>

            {/* Actions Grid */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-stretch sm:items-center justify-center">
              <button className="bg-white hover:bg-bg-sec text-primary px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer">
                Start Free Trial
                <ArrowRight className="h-4.5 w-4.5 text-primary" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer">
                <Calendar className="h-4.5 w-4.5" />
                Schedule Demo
              </button>
            </div>

            {/* Trial footer tag */}
            <p className="mt-4 text-xs text-white/60">
              No credit card required. 14-day free trial. Cancel anytime.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

import { CheckCircle2, ShieldCheck, RefreshCw, Layers, Zap } from 'lucide-react';

export default function Metrics() {
  const stats = [
    {
      metric: '99.9%',
      title: 'Uptime Guarantee',
      description: 'Enterprise reliability keeps your registers open and processing orders 24/7 without interruption.',
      icon: ShieldCheck,
      color: 'text-primary bg-primary-light',
    },
    {
      metric: 'Real-Time',
      title: 'Inventory Sync',
      description: 'Instant updates prevent double-selling across offline POS, Shopify, and Amazon marketplaces.',
      icon: RefreshCw,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      metric: 'Multi-Store',
      title: 'Unified Control',
      description: 'Seamlessly transfer stock, compare sales, and manage pricing across unlimited locations.',
      icon: Layers,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      metric: '< 2s',
      title: 'Checkout Speed',
      description: 'A lightning-fast checkout flow keeps queues moving and customers smiling in your physical stores.',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <section className="bg-bg-sec py-16 sm:py-20 border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary-light px-3 py-1 rounded-full">
            Trust & Performance
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-main mt-3">
            Designed to Meet the Demands of Growing Retailers
          </h2>
          <p className="text-text-sec mt-4 text-base sm:text-lg">
            RetailOne coordinates all storefronts, channels, and warehouse workflows into a single system of truth.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-border-main p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-left flex flex-col justify-between"
              >
                <div>
                  <div className={`p-2.5 rounded-xl inline-block ${stat.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                    {stat.metric}
                  </h3>
                  <h4 className="text-sm font-bold text-text-main mt-1.5 flex items-center gap-1.5">
                    {stat.title}
                    <CheckCircle2 className="h-4 w-4 text-success-main" />
                  </h4>
                  <p className="text-text-sec text-xs sm:text-sm mt-2 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Package, Globe, MonitorSmartphone, BarChart3, Store, ShieldCheck } from 'lucide-react';

export default function Features() {
  const features = [
    {
      title: 'Inventory Management',
      description: 'Track items across locations, set low-stock thresholds, trigger automated purchase orders, and manage stock counts.',
      icon: Package,
    },
    {
      title: 'Omnichannel Sales',
      description: 'Connect physical shops with Shopify, WooCommerce, and social marketplaces. Orders and stocks sync immediately.',
      icon: Globe,
    },
    {
      title: 'POS Terminal App',
      description: 'Run our fast checkout app on iPads, Android tablets, or custom POS registers with offline support and card integrations.',
      icon: MonitorSmartphone,
    },
    {
      title: 'Analytics Dashboard',
      description: 'Gain visual insights into daily sales, store conversion rates, top product categories, and gross profit margins.',
      icon: BarChart3,
    },
    {
      title: 'Multi-Store Management',
      description: 'Manage multiple warehouses and stores from a single login. Perform stock transfers and compare site statistics.',
      icon: Store,
    },
    {
      title: 'User Roles & Permissions',
      description: 'Define custom access levels for cashiers, inventory clerks, managers, and accountants. Audit staff action histories.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="features" className="bg-white py-16 sm:py-24 border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary-light px-3 py-1 rounded-full">
            Powerful Modules
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-main mt-3">
            Everything You Need to Run Your Retail Store
          </h2>
          <p className="text-text-sec mt-4 text-base sm:text-lg">
            Say goodbye to messy spreadsheets. Simplify store management with enterprise-level features tailored for high-volume retailers.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white p-6 sm:p-8 rounded-2xl border border-border-main shadow-sm hover:shadow-md hover:border-primary/45 transition-all duration-200 text-left flex flex-col justify-between"
              >
                <div>
                  {/* Icon Container */}
                  <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-text-main mt-6 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-text-sec mt-3 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Learn More link decoration */}
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform cursor-pointer">
                  Learn more &rarr;
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

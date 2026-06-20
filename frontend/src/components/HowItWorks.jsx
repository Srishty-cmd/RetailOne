import { PlusCircle, Database, CheckSquare, LineChart, ChevronRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Add Products',
      subtitle: 'Create items individually or import in bulk.',
      description: 'Sync your catalog instantly from existing Shopify, WooCommerce, or CSV spreadsheets. Add variations like size, color, SKU, and unit barcodes.',
      icon: PlusCircle,
    },
    {
      num: '02',
      title: 'Manage Inventory',
      subtitle: 'Distribute stock across channels.',
      description: 'Allocate quantities across physical store shelves, warehouses, and online marketplaces. Set smart safety-stock limits and low-stock alerts.',
      icon: Database,
    },
    {
      num: '03',
      title: 'Process Orders',
      subtitle: 'Run seamless checkouts in-store or web.',
      description: 'Ring up transactions on mobile POS registers, print receipts, and capture payments. Online orders flow directly to your store dashboards.',
      icon: CheckSquare,
    },
    {
      num: '04',
      title: 'Track Growth',
      subtitle: 'Analyze sales, profit margins, and performance.',
      description: 'Run automatic reports to check best-selling items, cash flow balances, worker productivity, and store-by-store margins in real time.',
      icon: LineChart,
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-24 border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary-light px-3 py-1 rounded-full">
            Onboarding Workflow
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-main mt-3">
            Getting Started with RetailOne is Simple
          </h2>
          <p className="text-text-sec mt-4 text-sm sm:text-base">
            Modernize your systems and align your team in four easy-to-follow steps.
          </p>
        </div>

        {/* Timeline Grid (Responsive: vertical on mobile, horizontal on desktop) */}
        <div className="relative">
          {/* Connecting line (Desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-border-main -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-bg-sec border border-border-main p-6 sm:p-8 rounded-2xl relative shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
                >
                  {/* Step Bubble Indicator */}
                  <div className="absolute -top-5 left-6 lg:left-1/2 lg:-translate-x-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white text-sm font-extrabold shadow border-4 border-white">
                    {step.num}
                  </div>

                  <div className="pt-2 text-left lg:text-center flex flex-col items-start lg:items-center">
                    {/* Icon container */}
                    <div className="h-10 w-10 rounded-lg bg-primary-light text-primary flex items-center justify-center mb-4 mt-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <h3 className="font-display text-lg font-bold text-text-main">
                      {step.title}
                    </h3>
                    <h4 className="text-xs font-semibold text-primary mt-1">
                      {step.subtitle}
                    </h4>
                    <p className="text-text-sec text-xs sm:text-sm mt-3 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Next Step indicator link */}
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-25 text-border-main bg-white p-1 rounded-full border border-border-main">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

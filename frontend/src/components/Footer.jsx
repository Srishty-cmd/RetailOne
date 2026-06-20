import { Store, Mail, Phone, MapPin } from 'lucide-react';

// Custom brand SVGs as Lucide has removed trademark logos in version 1+
const GithubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function Footer() {
  const productLinks = [
    { name: 'POS App', href: '#' },
    { name: 'Inventory Control', href: '#' },
    { name: 'Analytics Reports', href: '#' },
    { name: 'Multi-Store Sync', href: '#' },
    { name: 'Hardware Packages', href: '#' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Press & Media', href: '#' },
    { name: 'Affiliates', href: '#' },
    { name: 'Retail Partners', href: '#' },
  ];

  const resourceLinks = [
    { name: 'Knowledge Base', href: '#' },
    { name: 'Video Tutorials', href: '#' },
    { name: 'System Status', href: '#' },
    { name: 'API Reference', href: '#' },
    { name: 'Community Forum', href: '#' },
  ];

  return (
    <footer id="contact" className="bg-bg-sec border-t border-border-main pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-border-main">
          {/* Logo & Description */}
          <div className="md:col-span-4 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Store className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-text-main">
                Retail<span className="text-primary">OS</span>
              </span>
            </div>
            <p className="text-text-sec text-sm leading-relaxed max-w-sm">
              RetailOne is the unified retail operations system of choice for modern, high-growth merchant brands worldwide.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-text-sec hover:text-primary transition-colors p-1.5 bg-white border border-border-main rounded-lg shadow-sm hover:scale-105 duration-150">
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a href="#" className="text-text-sec hover:text-primary transition-colors p-1.5 bg-white border border-border-main rounded-lg shadow-sm hover:scale-105 duration-150">
                <GithubIcon className="h-4 w-4" />
              </a>
              <a href="#" className="text-text-sec hover:text-primary transition-colors p-1.5 bg-white border border-border-main rounded-lg shadow-sm hover:scale-105 duration-150">
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a href="#" className="text-text-sec hover:text-primary transition-colors p-1.5 bg-white border border-border-main rounded-lg shadow-sm hover:scale-105 duration-150">
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2 text-left">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm text-text-sec hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 text-left">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm text-text-sec hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 text-left">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm text-text-sec hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact details */}
          <div className="md:col-span-2 text-left">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-3.5 text-xs text-text-sec">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>support@retailos.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>+1 (800) 555-0199</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>150 Elgin St, Ottawa, ON K2P 1L4, Canada</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-text-sec">
          <p>&copy; {new Date().getFullYear()} RetailOS Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Menu, X, Store, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#showcase' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text-main">
              Retail<span className="text-primary">One</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-text-sec hover:text-primary transition-colors duration-150"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-text-sec hover:text-text-main transition-colors duration-150 cursor-pointer">
              Login
            </Link>
            <Link to="/register" className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-150 flex items-center gap-1.5 cursor-pointer">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-sec hover:text-text-main p-2 rounded-lg focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-border-main shadow-lg px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-text-sec hover:text-primary hover:bg-bg-sec transition-all duration-150"
            >
              {link.name}
            </a>
          ))}
          <div className="border-t border-border-main pt-4 flex flex-col gap-3 px-3">
            <Link to="/login" className="w-full text-center py-2.5 font-medium text-text-sec hover:text-text-main transition-colors duration-150 cursor-pointer">
              Login
            </Link>
            <Link to="/register" className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

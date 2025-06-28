import React, { useState, useEffect } from 'react';
import { Menu, X, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
1
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Success Stories', href: '#success-stories' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const navigate = (path: string) => {
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 font-lexend ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#ef2f5b] rounded-lg">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Collabglam
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="font-medium text-gray-700 hover:text-[#ef2f5b] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-[#ef2f5b] text-white font-medium rounded-lg hover:bg-[#c21f4f] transition-all transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(open => !open)}
            className="lg:hidden p-2 text-gray-700"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="block py-2 text-gray-700 font-medium hover:text-[#ef2f5b] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-[#ef2f5b] text-white font-medium rounded-lg hover:bg-[#c21f4f] transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

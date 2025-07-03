import React from 'react';
import { Share2, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
        { label: "Analytics", href: "#analytics" },
        { label: "Integrations", href: "#integrations" },
        { label: "API", href: "#api" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" },
        { label: "Careers", href: "#careers" },
        { label: "Press", href: "#press" },
        { label: "News", href: "#news" },
        { label: "Media Kit", href: "#media-kit" },
        { label: "Contact", href: "#contact" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#help" },
        { label: "Documentation", href: "#docs" },
        { label: "API Reference", href: "#api-docs" },
        { label: "Status", href: "#status" },
        { label: "Community", href: "#community" },
        { label: "Tutorials", href: "#tutorials" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#privacy" },
        { label: "Terms of Service", href: "#terms" },
        { label: "Cookie Policy", href: "#cookies" },
        { label: "GDPR", href: "#gdpr" },
        { label: "Security", href: "#security" },
        { label: "Compliance", href: "#compliance" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  return (
    <footer className="bg-gray-900 text-white font-lexend">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <img
                  src="./logo.png"
                  alt="Collabglam Logo"
                  width={50}
                  height={50}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">Collabglam</span>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering content creators worldwide to monetize their passion
                and build sustainable businesses through intelligent sharing and
                distribution.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <Mail className="h-4 w-4 mr-3" />
                  <span>hello@Collabglam.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="h-4 w-4 mr-3" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-4 w-4 mr-3" />
                  <span>San Francisco, CA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#ef2f5b] transition-colors"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-300">
                Get the latest updates, tips, and exclusive offers delivered to your inbox.
              </p>
            </div>

            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-80 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#ef2f5b] focus:border-transparent"
              />
              <button className="px-6 py-3 bg-[#ef2f5b] text-white font-semibold rounded-r-lg hover:bg-[#c21f4f] transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 Collabglam. All rights reserved.
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Made with ❤️ for creators worldwide</span>
              <div className="flex items-center space-x-4">
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#cookies" className="hover:text-white transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
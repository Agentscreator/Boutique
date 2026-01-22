"use client";

import { useState, useEffect } from "react";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "/inspiration", label: "Inspiration" },
  { href: "/policies", label: "Policies" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled
          ? "bg-[#e8edf2]/95 backdrop-blur-md py-4"
          : "bg-transparent py-6 md:py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="/" 
          className="relative z-10 cursor-pointer"
          onClick={(e) => {
            // Ensure home navigation works
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            } else {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <span className="font-[family-name:var(--font-script)] text-2xl md:text-3xl text-[#2d3748]">
            TNB
          </span>
        </a>

        {/* Navigation - Always visible */}
        <nav className="flex items-center gap-8 md:gap-14">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative font-sans text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#2d3748] hover:text-[#64748b] transition-colors duration-300 group cursor-pointer"
              onClick={(e) => {
                // Handle Services navigation from any page
                if (link.href === '#services') {
                  e.preventDefault();
                  
                  // If we're not on the home page, navigate to home first
                  if (window.location.pathname !== '/') {
                    window.location.href = '/#services';
                  } else {
                    // We're on home page, scroll to services section
                    const element = document.querySelector('#services') as HTMLElement;
                    if (element) {
                      const headerHeight = 100; // Account for fixed header
                      const elementPosition = element.offsetTop - headerHeight;
                      window.scrollTo({ 
                        top: elementPosition,
                        behavior: 'smooth'
                      });
                    }
                  }
                }
                // For other pages, let the default behavior handle it
              }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#2d3748] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
"use client";

import { Instagram } from "lucide-react";

// Custom TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-[#2d3748] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          {/* Large decorative text */}
          <div className="mb-10 select-none">
            <span className="text-[15vw] md:text-[10vw] font-serif font-light text-[#3d4a5c] uppercase tracking-wide">
              TNB
            </span>
          </div>

          {/* Logo */}
          <div className="mb-6">
            <span className="font-[family-name:var(--font-script)] text-3xl md:text-4xl text-white">
              {"Ty's nail Boutique"}
            </span>
          </div>

          {/* Tagline */}
          <p className="font-serif text-[#b8c5d1] text-xs tracking-[0.3em] uppercase mb-10">
            Beautiful nails, crafted with love
          </p>

          {/* Social */}
          <div className="flex flex-col items-center gap-4 mb-14">
            <a
              href="https://instagram.com/tysnailboutique"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300"
            >
              <Instagram className="w-5 h-5" />
              <span className="font-sans text-sm tracking-wider">
                @tysnailboutique
              </span>
            </a>
            
            <a
              href="https://www.tiktok.com/@tysnailboutique?_r=1&_t=ZT-93F3J5aRv8n"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300"
            >
              <TikTokIcon className="w-5 h-5" />
              <span className="font-sans text-sm tracking-wider">
                @tysnailboutique
              </span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8 md:gap-12 mb-14">
            {["Services", "Inspiration", "Policies"].map((item) => (
              <a
                key={item}
                href={item === "Services" ? "#services" : `/${item.toLowerCase()}`}
                className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#b8c5d1]/60 hover:text-white transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-20 h-px bg-[#b8c5d1]/20 mb-10" />

          {/* Powered By Branding */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-[#3d4a5c]/30 border border-[#b8c5d1]/10 hover:bg-[#3d4a5c]/40 transition-all duration-300">
              <img
                src="/Powered By Ivorys Choice.png"
                alt="Ivory's Choice Logo"
                className="h-5 md:h-6 w-auto opacity-80"
                style={{
                  filter: 'brightness(0) invert(1) opacity(0.8)'
                }}
              />
              <span className="font-sans text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-[#b8c5d1]/80 font-medium">
                Powered by IVORY'S CHOICE
              </span>
            </div>
          </div>

          {/* Copyright */}
          <p className="font-sans text-[10px] text-[#b8c5d1]/40 tracking-[0.15em] uppercase">
            © {new Date().getFullYear()} Ty&apos;s nail Boutique. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#e8edf2]">
      {/* Large background letters */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
        <span className="text-[28vw] md:text-[22vw] font-serif font-light tracking-tight text-[#d1dbe6]/50">
          TNB
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="font-[family-name:var(--font-script)] text-5xl md:text-7xl lg:text-8xl text-[#2d3748] mb-4">
            {"Ty's nail Boutique"}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <p className="font-serif text-base md:text-lg text-[#64748b] tracking-[0.3em] uppercase mt-8">
            Beautiful nails, crafted with love
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mt-14 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#services"
            className="group inline-flex items-center justify-center px-10 py-4 bg-[#2d3748] text-white font-sans text-xs tracking-[0.2em] uppercase hover:bg-[#1a202c] transition-all duration-500"
          >
            <span>View Services</span>
            <svg
              className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
          <a
            href="#policies"
            className="inline-flex items-center justify-center px-10 py-4 border border-[#2d3748] text-[#2d3748] font-sans text-xs tracking-[0.2em] uppercase hover:bg-[#2d3748] hover:text-white transition-all duration-500"
          >
            Booking Info
          </a>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#64748b]">
            Scroll
          </span>
          <div className="w-px h-12 bg-[#b8c5d1]" />
        </motion.div>
      </div>
    </section>
  );
}

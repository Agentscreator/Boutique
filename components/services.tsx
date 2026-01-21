"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar } from "lucide-react";
import { BookingFlow } from "./booking-flow";
import { Button } from "@/components/ui/button";

const services = {
  hands: {
    title: "HANDS - ACRYLIC & BIAB",
    items: [
      { name: "Solid one colour sets (short/mid)", price: "£30" },
      { name: "Any colour french tip sets (short/mid)", price: "£35" },
      {
        name: "Nail art sets (short/mid)",
        price: "£40",
        includes: ["croc print", "chrome", "abstract designs etc."],
      },
      { name: "Freestyle set (short/mid/long)", price: "£45" },
    ],
  },
  toes: {
    title: "TOES - ACRYLIC & BIAB",
    items: [
      { name: "Solid one colour acrylic, overlay or with tips", price: "£30" },
      {
        name: "Any colour french tip acrylic, overlay or with tips",
        price: "£35",
      },
    ],
  },
  infills: {
    title: "INFILLS",
    items: [
      {
        name: "For both hands & feet",
        price: "£5 less than the full set price",
      },
    ],
  },
  deals: {
    title: "DEALS",
    items: [{ name: "Any colour french tip hands & toes", price: "£60" }],
  },
  extras: {
    title: "EXTRAS / ADD ONS",
    items: [
      { name: "1 set of charms (2)", price: "£1" },
      { name: "Long length", price: "£3" },
      { name: "XL length", price: "£5" },
      { name: "Blinged out nails (2)", price: "£5" },
      { name: "3D Gel / Acrylic flower (2)", price: "£5" },
      { name: "Removal / soak offs", price: "£10" },
    ],
  },
};

export function Services() {
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);

  return (
    <>
      <section id="services" className="relative bg-[#e8edf2] py-28 md:py-40 overflow-hidden">
      {/* Vertical text - left side */}
      <div className="absolute left-2 md:left-6 lg:left-12 top-40 md:top-52 z-20">
        <span className="font-[family-name:var(--font-script)] text-5xl md:text-7xl lg:text-8xl text-[#2d3748]/15 [writing-mode:vertical-lr] rotate-180 select-none">
          Price list
        </span>
      </div>

      {/* Large background text */}
      <div className="absolute top-16 md:top-20 left-0 right-0 select-none pointer-events-none overflow-hidden">
        <div className="text-center">
          <span className="text-[18vw] md:text-[14vw] font-serif font-light tracking-tight text-[#d1dbe6]/50 uppercase whitespace-nowrap">
            SERVICES
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-12 lg:px-8">
        {/* Section header with overlapping typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-24"
        >
          <div className="relative inline-block">
            <h2 className="font-serif text-6xl md:text-7xl lg:text-8xl font-light text-[#c5d1dc] uppercase tracking-wide">
              PRICE LIST
            </h2>
            <span className="absolute top-1/2 left-1/4 md:left-1/3 -translate-y-1/2 font-[family-name:var(--font-script)] text-3xl md:text-5xl text-[#2d3748]">
              price list
            </span>
          </div>
        </motion.div>

        {/* Services list */}
        <div className="space-y-14 md:space-y-16">
          {Object.entries(services).map(([key, category], categoryIndex) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <h3 className="font-serif text-sm md:text-base tracking-[0.25em] text-[#2d3748] border-b border-[#b8c5d1]/60 pb-3 mb-8 uppercase">
                {category.title}
              </h3>

              <div className="space-y-5">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <div className="flex justify-between items-start gap-4 group">
                      <div className="flex items-start gap-3">
                        <Heart className="w-4 h-4 mt-1.5 text-[#b8c5d1] flex-shrink-0 group-hover:text-[#8fa5b8] transition-colors" />
                        <span className="font-sans text-[#2d3748] text-sm md:text-base">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-serif text-[#2d3748] text-sm md:text-base whitespace-nowrap">
                        {item.price}
                      </span>
                    </div>
                    {"includes" in item && item.includes && (
                      <div className="ml-7 mt-2 space-y-1">
                        {item.includes.map((inc, i) => (
                          <p
                            key={i}
                            className="text-xs md:text-sm text-[#64748b] font-sans"
                          >
                            · {inc}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Book now CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 md:mt-24 text-center"
        >
          <Button
            onClick={() => setIsBookingFlowOpen(true)}
            className="group inline-flex items-center justify-center px-12 py-5 bg-[#2d3748] text-white font-sans text-xs tracking-[0.2em] uppercase hover:bg-[#1a202c] transition-all duration-500"
          >
            <Calendar className="w-4 h-4 mr-3" />
            <span>Book Your Appointment</span>
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
          </Button>
        </motion.div>
      </div>
    </section>

    <BookingFlow 
      isOpen={isBookingFlowOpen} 
      onClose={() => setIsBookingFlowOpen(false)} 
    />
  </>
  );
}

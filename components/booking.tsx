"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MessageCircleHeart } from "lucide-react";
import { BookingFlow } from "./booking-flow";

export function Booking() {
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);

  return (
    <>
      <section
        id="book"
        className="relative bg-[#f5f7f9] py-28 md:py-40 overflow-hidden"
      >
      {/* Vertical text - left side */}
      <div className="absolute left-2 md:left-6 lg:left-12 top-40 md:top-52 z-20">
        <span className="font-[family-name:var(--font-script)] text-5xl md:text-7xl lg:text-8xl text-[#2d3748]/10 [writing-mode:vertical-lr] rotate-180 select-none">
          Book now
        </span>
      </div>

      {/* Large background text */}
      <div className="absolute top-16 md:top-20 left-0 right-0 select-none pointer-events-none overflow-hidden">
        <div className="text-center">
          <span className="text-[22vw] md:text-[16vw] font-serif font-light tracking-tight text-[#e8edf2] uppercase whitespace-nowrap">
            BOOK
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
          className="mb-16 md:mb-20 text-center"
        >
          <div className="relative inline-block mb-8">
            <h2 className="font-serif text-6xl md:text-7xl lg:text-8xl font-light text-[#d8e0e8] uppercase tracking-wide">
              BOOK
            </h2>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-script)] text-3xl md:text-5xl text-[#2d3748] whitespace-nowrap">
              book now
            </span>
          </div>
          <p className="font-sans text-[#64748b] max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Ready to get your nails done? Book your appointment today and
            let&apos;s create something beautiful together.
          </p>
        </motion.div>

        {/* Booking steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-10 md:gap-8 mb-20"
        >
          {[
            {
              icon: Calendar,
              title: "Choose a Date",
              description:
                "Check my availability posted daily and pick a day that works for you",
            },
            {
              icon: Clock,
              title: "Select a Time",
              description:
                "Pick your preferred time slot or request a custom time",
            },
            {
              icon: MessageCircleHeart,
              title: "Send Inspiration",
              description:
                "Share your nail design ideas so we can create your perfect set",
            },
          ].map((step, index) => (
            <div key={index} className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#e8edf2] flex items-center justify-center group-hover:bg-[#d1dbe6] transition-colors duration-500">
                <step.icon className="w-8 h-8 text-[#8fa5b8] group-hover:text-[#6787a0] transition-colors duration-500" />
              </div>
              <h3 className="font-serif text-lg md:text-xl text-[#2d3748] mb-3">
                {step.title}
              </h3>
              <p className="font-sans text-sm text-[#64748b] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
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

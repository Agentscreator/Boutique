"use client";

import { motion } from "framer-motion";

const policies = [
  {
    title: "BOOKINGS",
    content:
      "Hey my lovessss, glad you chose me to do your nails! Booking with me means you have read & understood all my policies. Hope to see you soon xx",
  },
  {
    title: "HOW TO BOOK",
    content:
      "Please book via my services. Look at my availability which will be posted & updated everyday. Select your chosen day & time. If the time on a particular day isn't there you can request a time & I can possibly fit you in.",
  },
  {
    title: "DESIGNS",
    content:
      "As I am a beginner nail tech I may not be able to do every design but I will try my best. When messaging me please send your inspiration so I am able to tell you if I can or can't do that design or to see if we can sort something out like a similar set.",
  },
  {
    title: "DEPOSITS",
    content:
      "A deposit may be required to secure your booking. This will be deducted from your final price on the day of your appointment.",
  },
  {
    title: "CANCELLATIONS",
    content:
      "Please give at least 24 hours notice if you need to cancel or reschedule. Late cancellations may result in loss of deposit.",
  },
];

export function Policies() {
  return (
    <section
      id="policies"
      className="relative bg-[#b8c5d1] py-28 md:py-40 overflow-hidden mt-20"
    >
      {/* Vertical text - left side */}
      <div className="absolute left-2 md:left-6 lg:left-12 top-40 md:top-52 z-20">
        <span className="font-[family-name:var(--font-script)] text-5xl md:text-7xl lg:text-8xl text-[#2d3748]/15 [writing-mode:vertical-lr] rotate-180 select-none">
          Policies
        </span>
      </div>

      {/* Large background text */}
      <div className="absolute top-16 md:top-20 left-0 right-0 select-none pointer-events-none overflow-hidden">
        <div className="text-center">
          <span className="text-[18vw] md:text-[14vw] font-serif font-light tracking-tight text-[#a3b4c4]/40 uppercase whitespace-nowrap">
            POLICIES
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-8 md:px-12 lg:px-8">
        {/* Section header with overlapping typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-24"
        >
          <div className="relative inline-block">
            <h2 className="font-serif text-6xl md:text-7xl lg:text-8xl font-light text-[#96abbe] uppercase tracking-wide">
              POLICIES
            </h2>
            <span className="absolute top-1/2 left-1/4 md:left-1/3 -translate-y-1/2 font-[family-name:var(--font-script)] text-3xl md:text-5xl text-[#2d3748]">
              policies
            </span>
          </div>
        </motion.div>

        {/* Policies content */}
        <div className="space-y-12 md:space-y-14">
          {policies.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <h3 className="font-serif text-xs md:text-sm tracking-[0.3em] text-[#2d3748] mb-4 uppercase">
                {policy.title}
              </h3>
              <p className="font-sans text-[#2d3748]/80 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
                {policy.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

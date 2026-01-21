"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { X, Heart, Instagram } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Your actual inspiration images from the Inspo Photos folder
const inspirationImages = [
  "IMG_8996.jpg",
  "IMG_8997.jpg",
  "IMG_8998.jpg",
  "IMG_8999.jpg",
  "IMG_9001.jpg",
  "IMG_9002.jpg",
  "IMG_9003.jpg",
  "IMG_9004.jpg",
];

export default function InspirationPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen">
      <Header />
      
      <section className="relative bg-[#f5f7f9] py-28 md:py-40 overflow-hidden mt-20">
        {/* Vertical text - left side */}
        <div className="absolute left-2 md:left-6 lg:left-12 top-40 md:top-52 z-20">
          <span className="font-[family-name:var(--font-script)] text-5xl md:text-7xl lg:text-8xl text-[#2d3748]/10 [writing-mode:vertical-lr] rotate-180 select-none">
            Inspiration
          </span>
        </div>

        {/* Large background text */}
        <div className="absolute top-16 md:top-20 left-0 right-0 select-none pointer-events-none overflow-hidden">
          <div className="text-center">
            <span className="text-[18vw] md:text-[14vw] font-serif font-light tracking-tight text-[#e8edf2] uppercase whitespace-nowrap">
              INSPO
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-8 md:px-12 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-20 text-center"
          >
            <div className="relative inline-block mb-8">
              <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-light text-[#d8e0e8] uppercase tracking-wide">
                INSPO
              </h1>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-script)] text-3xl md:text-5xl text-[#2d3748] whitespace-nowrap">
                inspiration
              </span>
            </div>
            <p className="font-sans text-[#64748b] max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Browse through my latest nail art creations for inspiration for your next set. 
              Each design tells a story and showcases different techniques and styles.
            </p>
          </motion.div>

          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {inspirationImages.map((image, index) => (
              <motion.div
                key={image}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative aspect-square overflow-hidden rounded-lg bg-[#e8edf2] cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={`/Inspo Photos/${image}`}
                  alt={`Nail inspiration ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 md:mt-20 text-center"
          >
            <div className="bg-white p-8 md:p-12 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#b8c5d1] flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl text-[#2d3748] mb-4">
                Love what you see?
              </h3>
              <p className="font-sans text-[#64748b] mb-8 max-w-md mx-auto text-sm md:text-base leading-relaxed">
                Follow me on Instagram for daily updates, behind-the-scenes content, and more nail inspiration!
              </p>
              <a
                href="https://instagram.com/tysnailboutique"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center px-8 py-3 bg-[#2d3748] text-white font-sans text-xs tracking-[0.2em] uppercase hover:bg-[#1a202c] transition-all duration-500"
              >
                <Instagram className="w-4 h-4 mr-2" />
                <span>Follow @tysnailboutique</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {selectedImage && (
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={`/Inspo Photos/${selectedImage}`}
                alt="Nail inspiration"
                className="w-full h-auto max-h-[90vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}
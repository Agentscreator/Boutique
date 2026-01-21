"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MessageCircleHeart, User, Phone, Mail, ArrowLeft, ArrowRight, Check, X, Heart, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BookingData {
  services: string[];
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  inspiration: string;
}

interface ServiceItem {
  id: string;
  name: string;
  price: string;
  includes?: string[];
}

interface ServiceCategory {
  title: string;
  items: ServiceItem[];
}

const services: Record<string, ServiceCategory> = {
  hands: {
    title: "HANDS - ACRYLIC & BIAB",
    items: [
      { id: "solid-short-mid", name: "Solid one colour sets (short/mid)", price: "£30" },
      { id: "french-short-mid", name: "Any colour french tip sets (short/mid)", price: "£35" },
      { id: "nail-art-short-mid", name: "Nail art sets (short/mid)", price: "£40", includes: ["croc print", "chrome", "abstract designs etc."] },
      { id: "freestyle", name: "Freestyle set (short/mid/long)", price: "£45" },
    ],
  },
  toes: {
    title: "TOES - ACRYLIC & BIAB",
    items: [
      { id: "toes-solid", name: "Solid one colour acrylic, overlay or with tips", price: "£30" },
      { id: "toes-french", name: "Any colour french tip acrylic, overlay or with tips", price: "£35" },
    ],
  },
  infills: {
    title: "INFILLS",
    items: [
      { id: "infills", name: "For both hands & feet", price: "£5 less than the full set price" },
    ],
  },
  deals: {
    title: "DEALS",
    items: [
      { id: "deal-french", name: "Any colour french tip hands & toes", price: "£60" }
    ],
  },
  extras: {
    title: "EXTRAS / ADD ONS",
    items: [
      { id: "charms", name: "1 set of charms (2)", price: "£1" },
      { id: "long-length", name: "Long length", price: "£3" },
      { id: "xl-length", name: "XL length", price: "£5" },
      { id: "bling", name: "Blinged out nails (2)", price: "£5" },
      { id: "3d-flower", name: "3D Gel / Acrylic flower (2)", price: "£5" },
      { id: "removal", name: "Removal / soak offs", price: "£10" },
    ],
  },
};

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

export function BookingFlow({ isOpen, onClose }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    services: [],
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    inspiration: "",
  });
  const [heartAnimations, setHeartAnimations] = useState<{ [key: string]: boolean }>({});

  const totalSteps = 4;

  const hasBIAB = (serviceName: string) => {
    return serviceName.toLowerCase().includes('biab') || serviceName.toLowerCase().includes('acrylic & biab');
  };

  const biabTooltipText = "BIAB - Builder In A Bottle, is a type of gel nail product which is a more flexible & natural alternative to acrylic. Essentially acting as an overlay on your natural nails to add strength whilst maintaining your nails health, helping them to grow longer & prevent breakage.";

  const calculatePricing = () => {
    const selectedServiceDetails: { name: string; price: number }[] = [];
    let subtotal = 0;

    // Find selected services and their prices
    Object.values(services).forEach(category => {
      category.items.forEach(service => {
        if (bookingData.services.includes(service.name)) {
          // Extract price number from string like "£30"
          const priceMatch = service.price.match(/£(\d+)/);
          const price = priceMatch ? parseInt(priceMatch[1]) : 0;
          
          selectedServiceDetails.push({
            name: service.name,
            price: price
          });
          subtotal += price;
        }
      });
    });

    const platformFee = parseFloat((subtotal * 0.15).toFixed(2)); // 15% platform fee with decimals
    const total = parseFloat((subtotal + platformFee).toFixed(2));

    return {
      services: selectedServiceDetails,
      subtotal,
      platformFee,
      total
    };
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceToggle = (serviceName: string) => {
    const isSelected = bookingData.services.includes(serviceName);
    let newServices;
    
    if (isSelected) {
      newServices = bookingData.services.filter(s => s !== serviceName);
    } else {
      newServices = [...bookingData.services, serviceName];
      // Trigger heart animation
      setHeartAnimations(prev => ({ ...prev, [serviceName]: true }));
      setTimeout(() => {
        setHeartAnimations(prev => ({ ...prev, [serviceName]: false }));
      }, 1000);
    }
    
    setBookingData({ ...bookingData, services: newServices });
  };

  const handleSubmit = () => {
    // Create Instagram DM link with booking details
    const pricing = calculatePricing();
    
    let servicesText = "";
    pricing.services.forEach(service => {
      servicesText += `• ${service.name} - £${service.price}\n`;
    });

    const message = `Hi! I'd like to book an appointment:

📅 APPOINTMENT DETAILS:
Date: ${bookingData.date}
Time: ${bookingData.time}
Name: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}

�  SERVICES REQUESTED:
${servicesText}
💰 PRICING BREAKDOWN:
Subtotal: £${pricing.subtotal.toFixed(2)}
Platform Service Fee (15%): £${pricing.platformFee.toFixed(2)}
Total: £${pricing.total.toFixed(2)}

🎨 Design Inspiration: ${bookingData.inspiration || "None specified"}

Looking forward to hearing from you!`;

    const encodedMessage = encodeURIComponent(message);
    const instagramUrl = `https://instagram.com/tysnailboutique`;
    
    // Open Instagram in new tab
    window.open(instagramUrl, '_blank');
    
    // Show success message and close modal
    alert("Your booking request has been prepared! Please send the message on Instagram to complete your booking.");
    onClose();
    
    // Reset form
    setCurrentStep(1);
    setBookingData({
      services: [],
      date: "",
      time: "",
      name: "",
      email: "",
      phone: "",
      inspiration: "",
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return bookingData.services.length > 0;
      case 2:
        return bookingData.date !== "" && bookingData.time !== "";
      case 3:
        return bookingData.name !== "" && bookingData.email !== "" && bookingData.phone !== "";
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-[#2d3748] mb-2">Choose Your Services</h3>
              <p className="text-[#64748b]">Select one or more services you'd like to book</p>
            </div>
            
            <div className="space-y-8">
              {Object.entries(services).map(([categoryKey, category]) => (
                <div key={categoryKey} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-sm tracking-[0.25em] text-[#2d3748] border-b border-[#e2e8f0] pb-2 uppercase">
                      {category.title}
                    </h4>
                    {hasBIAB(category.title) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 cursor-help text-[#64748b] hover:text-[#2d3748] mb-2" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3 text-sm">
                            <p>{biabTooltipText}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  <div className="grid gap-3">
                    {category.items.map((service) => {
                      const isSelected = bookingData.services.includes(service.name);
                      const hasAnimation = heartAnimations[service.name];
                      
                      return (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-md relative overflow-hidden ${
                            isSelected
                              ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                              : "hover:bg-[#f8fafc] border-[#e2e8f0]"
                          }`}
                          onClick={() => handleServiceToggle(service.name)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2">
                                  <h5 className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-[#2d3748]'}`}>
                                    {service.name}
                                  </h5>
                                  {hasBIAB(service.name) && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className={`w-4 h-4 cursor-help ${isSelected ? 'text-blue-600' : 'text-[#64748b]'} hover:text-[#2d3748]`} />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs p-3 text-sm">
                                          <p>{biabTooltipText}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                                {service.includes && service.includes.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {service.includes.map((inc: string, i: number) => (
                                      <p key={i} className={`text-xs ${isSelected ? 'text-blue-600' : 'text-[#64748b]'}`}>
                                        · {inc}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 flex-shrink-0">
                                <div className="text-right">
                                  <p className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-[#2d3748]'}`}>
                                    {service.price}
                                  </p>
                                </div>
                                <div className="relative">
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="relative"
                                  >
                                    <Heart
                                      className={`w-5 h-5 transition-all duration-300 ${
                                        isSelected
                                          ? 'fill-blue-500 text-blue-500'
                                          : 'text-gray-300 hover:text-blue-300'
                                      }`}
                                    />
                                  </motion.div>
                                  
                                  {/* Heart animation particles */}
                                  <AnimatePresence>
                                    {hasAnimation && (
                                      <div className="absolute inset-0 pointer-events-none">
                                        {[...Array(6)].map((_, i) => (
                                          <motion.div
                                            key={i}
                                            initial={{ 
                                              opacity: 1, 
                                              scale: 0.5,
                                              x: 0,
                                              y: 0
                                            }}
                                            animate={{ 
                                              opacity: 0, 
                                              scale: 1.5,
                                              x: (Math.random() - 0.5) * 60,
                                              y: (Math.random() - 0.5) * 60
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{ 
                                              duration: 1,
                                              delay: i * 0.1,
                                              ease: "easeOut"
                                            }}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                          >
                                            <Heart className="w-3 h-3 fill-blue-400 text-blue-400" />
                                          </motion.div>
                                        ))}
                                      </div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          
                          {/* Selection indicator */}
                          {isSelected && (
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 origin-left"
                            />
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {bookingData.services.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6"
              >
                <p className="text-blue-700 font-medium">
                  {bookingData.services.length} service{bookingData.services.length > 1 ? 's' : ''} selected
                </p>
                <div className="text-blue-600 text-sm mt-2 max-h-20 overflow-y-auto">
                  {bookingData.services.map((service, index) => (
                    <div key={index} className="truncate">
                      {service}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-[#2d3748] mb-2">Select Date & Time</h3>
              <p className="text-[#64748b]">Choose your preferred appointment slot</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="date" className="text-[#2d3748] font-medium">Preferred Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-[#2d3748] font-medium">Preferred Time</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={bookingData.time === time ? "default" : "outline"}
                      className={`${
                        bookingData.time === time
                          ? "bg-[#2d3748] text-white"
                          : "border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
                      }`}
                      onClick={() => setBookingData({ ...bookingData, time })}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-[#2d3748] mb-2">Your Information</h3>
              <p className="text-[#64748b]">Tell us how to reach you</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#2d3748] font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#2d3748] font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-[#2d3748] font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="mt-2"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-[#2d3748] mb-2">Design Inspiration</h3>
              <p className="text-[#64748b]">Share your nail design ideas (optional)</p>
            </div>

            <div>
              <Label htmlFor="inspiration" className="text-[#2d3748] font-medium">
                Describe your desired nail design or share inspiration
              </Label>
              <Textarea
                id="inspiration"
                value={bookingData.inspiration}
                onChange={(e) => setBookingData({ ...bookingData, inspiration: e.target.value })}
                placeholder="Describe colors, patterns, or styles you'd like. You can also mention if you'll send photos on Instagram!"
                className="mt-2 min-h-[120px]"
              />
            </div>

            <Card className="bg-[#f8fafc] border-[#e2e8f0]">
              <CardHeader>
                <CardTitle className="text-lg text-[#2d3748]">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Appointment Details */}
                <div className="space-y-3 pb-4 border-b border-[#e2e8f0]">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Date:</span>
                    <span className="text-[#2d3748] font-medium">{bookingData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Time:</span>
                    <span className="text-[#2d3748] font-medium">{bookingData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Name:</span>
                    <span className="text-[#2d3748] font-medium">{bookingData.name}</span>
                  </div>
                </div>

                {/* Services & Pricing */}
                {(() => {
                  const pricing = calculatePricing();
                  return (
                    <div className="space-y-3">
                      <h4 className="text-[#2d3748] font-medium text-sm">Services & Pricing</h4>
                      
                      {/* Individual Services */}
                      <div className="space-y-2">
                        {pricing.services.map((service, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-[#64748b] text-sm">{service.name}</span>
                            <span className="text-[#2d3748] font-medium">£{service.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Breakdown */}
                      {pricing.services.length > 0 && (
                        <div className="pt-3 border-t border-[#e2e8f0] space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[#64748b]">Subtotal:</span>
                            <span className="text-[#2d3748] font-medium">£{pricing.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#64748b] text-sm">Platform Service Fee (15%):</span>
                            <span className="text-[#2d3748] font-medium">£{pricing.platformFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-[#e2e8f0]">
                            <span className="text-[#2d3748] font-semibold">Total:</span>
                            <span className="text-[#2d3748] font-semibold text-lg">£{pricing.total.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[#64748b] hover:text-[#2d3748]"
              >
                <X className="w-4 h-4" />
              </Button>
              <span className="font-serif text-xl text-[#2d3748]">Book Appointment</span>
              <div className="w-8" /> {/* Spacer */}
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      i + 1 <= currentStep
                        ? "bg-[#2d3748] text-white"
                        : "bg-[#e2e8f0] text-[#64748b]"
                    }`}
                  >
                    {i + 1 <= currentStep ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        i + 1 < currentStep ? "bg-[#2d3748]" : "bg-[#e2e8f0]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#e2e8f0]">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                className="bg-[#2d3748] text-white hover:bg-[#1a202c]"
              >
                Complete Booking
                <MessageCircleHeart className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-[#2d3748] text-white hover:bg-[#1a202c] disabled:bg-[#e2e8f0] disabled:text-[#64748b]"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
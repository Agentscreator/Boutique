"use client";

import { motion } from "framer-motion";
import { Check, X, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BookingSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    date: string;
    time: string;
    email: string;
  };
  bookingId: number | null;
  totalPrice: number;
}

export function BookingSuccess({ isOpen, onClose, bookingData, bookingId, totalPrice }: BookingSuccessProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[#64748b] hover:text-[#2d3748]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            {/* Success Message */}
            <div>
              <h3 className="text-2xl font-serif text-[#2d3748] mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-[#64748b]">
                Your appointment has been successfully booked
              </p>
              {bookingId && (
                <p className="text-sm text-[#64748b] mt-2">
                  Booking ID: #{bookingId}
                </p>
              )}
            </div>

            {/* Booking Summary */}
            <Card className="bg-[#f8fafc] border-[#e2e8f0] text-left">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Date:</span>
                    <span className="text-[#2d3748] font-medium">{bookingData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Time:</span>
                    <span className="text-[#2d3748] font-medium">{bookingData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Total:</span>
                    <span className="text-[#2d3748] font-semibold text-lg">£{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download App CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-[#2d3748]">
                  Get the Full Experience
                </h4>
              </div>
              <p className="text-[#64748b] mb-6 text-sm">
                Download Ivory's Choice to manage your bookings, chat with your nail tech, save design inspiration, and get exclusive features!
              </p>
              <a
                href="https://apps.apple.com/us/app/ivorys-choice/id6756433237"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-4 bg-[#2d3748] text-white font-medium rounded-lg hover:bg-[#1a202c] transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Ivory's Choice
              </a>
              <p className="text-xs text-[#64748b] mt-3">
                Available on iOS • Coming soon to Android
              </p>
            </div>

            {/* Confirmation Email Notice */}
            <p className="text-sm text-[#64748b]">
              A confirmation email has been sent to <strong>{bookingData.email}</strong>
            </p>

            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
            >
              Close
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

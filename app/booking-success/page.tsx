"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Download, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen bg-[#e8edf2] py-20">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Success Icon */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-serif text-[#2d3748] mb-3">
              Payment Successful!
            </h1>
            <p className="text-[#64748b] text-lg">
              Your appointment has been confirmed
            </p>
            {bookingId && (
              <p className="text-sm text-[#64748b] mt-2">
                Booking ID: #{bookingId}
              </p>
            )}
          </div>

          {/* Confirmation Card */}
          <Card className="bg-white border-[#e2e8f0]">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-[#2d3748] mb-4">
                What's Next?
              </h3>
              <ul className="space-y-3 text-[#64748b]">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>You'll receive a confirmation email shortly</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Your nail tech will be notified of your booking</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Download the app to manage your appointment</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Download App CTA */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-100">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
              <h4 className="text-xl font-semibold text-[#2d3748]">
                Get the Full Experience
              </h4>
            </div>
            <p className="text-[#64748b] mb-6 text-center">
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
            <p className="text-xs text-[#64748b] mt-3 text-center">
              Available on iOS • Coming soon to Android
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/">
              <Button
                variant="outline"
                className="border-[#e2e8f0] text-[#64748b] hover:bg-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#e8edf2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2d3748] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748b]">Confirming your booking...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}

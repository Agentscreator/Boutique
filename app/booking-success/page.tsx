"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Download, Sparkles, ArrowLeft, User, Mail, Lock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const isNewAccount = searchParams.get('new_account') === 'true';
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Automatically create session for the user
    const createSession = async () => {
      if (!bookingId || isCreatingSession || sessionCreated) return;
      
      setIsCreatingSession(true);
      try {
        const response = await fetch('/api/auth/create-booking-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookingId }),
        });

        if (response.ok) {
          setSessionCreated(true);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      } finally {
        setIsCreatingSession(false);
      }
    };

    createSession();
  }, [bookingId, isCreatingSession, sessionCreated]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

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
              {isNewAccount ? "Welcome to Ivory's Choice!" : "Payment Successful!"}
            </h1>
            <p className="text-[#64748b] text-lg">
              {isNewAccount 
                ? "Your account has been created and your appointment is confirmed" 
                : "Your appointment has been confirmed"}
            </p>
            {bookingId && (
              <p className="text-sm text-[#64748b] mt-2">
                Booking ID: #{bookingId}
              </p>
            )}
          </div>

          {/* New Account Info */}
          {isNewAccount && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-[#2d3748]">
                    Your Ivory's Choice Account
                  </h3>
                </div>
                <p className="text-[#64748b] mb-4">
                  We've automatically created an account for you! You're now logged in and can access all features.
                </p>
                <div className="space-y-3 bg-white/60 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-[#64748b] mr-2" />
                      <span className="text-[#2d3748]">Check your email for login details</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <Lock className="w-4 h-4 text-[#64748b] mr-2" />
                    <span className="text-[#64748b]">You can set a new password in your account settings</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Card */}
          <Card className="bg-white border-[#e2e8f0]">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-[#2d3748] mb-4">
                What's Next?
              </h3>
              <ul className="space-y-3 text-[#64748b]">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>You'll receive a confirmation email with your booking details{isNewAccount ? ' and account information' : ''}</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Your nail tech will be notified of your booking</span>
                </li>
                {isNewAccount && (
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>You can now manage your bookings and view your appointment history</span>
                  </li>
                )}
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Download the app for the best experience</span>
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
            <Button
              variant="outline"
              className="border-[#e2e8f0] text-[#64748b] hover:bg-white"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
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

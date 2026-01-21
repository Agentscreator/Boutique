import React from "react"
import type { Metadata } from 'next'
import { Cormorant_Garamond, Dancing_Script, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif"
});

const dancing = Dancing_Script({ 
  subsets: ["latin"],
  variable: "--font-script"
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Ty's nail Boutique | TNB",
  description: 'Your go-to nail tech for beautiful, personalized nail designs. Book your appointment today!',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} ${dancing.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

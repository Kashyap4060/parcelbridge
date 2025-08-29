import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HybridAuthProvider } from "@/hooks/useHybridAuth";
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Parcel Bridge - Connect Senders with Train Passengers",
  description: "Secure parcel delivery across India through verified train passengers. Real-time tracking, OTP verification, and wallet payments.",
  metadataBase: new URL("https://parcelbridge.in"),
  keywords: ["parcel delivery", "train passengers", "logistics", "India", "secure delivery", "peer-to-peer"],
  authors: [{ name: "Parcel Bridge Team" }],
  creator: "Parcel Bridge Technologies Pvt. Ltd.",
  publisher: "Parcel Bridge",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://parcelbridge.in",
    title: "Parcel Bridge - Connect Senders with Train Passengers",
    description: "Secure parcel delivery across India through verified train passengers. Real-time tracking, OTP verification, and wallet payments.",
    siteName: "Parcel Bridge",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Parcel Bridge - Secure Parcel Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parcel Bridge - Connect Senders with Train Passengers",
    description: "Secure parcel delivery across India through verified train passengers",
    site: "@parcelbridge",
    creator: "@parcelbridge",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#2563EB',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-blue-700 focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>
        <HybridAuthProvider>
          <main id="main-content" role="main" className="min-h-screen">
            {children}
          </main>
        </HybridAuthProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}

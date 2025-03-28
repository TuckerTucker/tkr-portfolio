import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageViewTracker } from "@/components/Analytics/PageViewTracker"; // Import tracker
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Update metadata from .clinerules
export const metadata: Metadata = {
  title: "Tucker's UX Portfolio",
  description: "A web based portfolio showcasing UX projects and process by Sean 'Tucker' Harley",
  authors: [{ name: "Sean 'Tucker' Harley" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`} // Added font-sans
      >
        {children}
        <PageViewTracker /> {/* Add tracker */}
      </body>
    </html>
  );
}

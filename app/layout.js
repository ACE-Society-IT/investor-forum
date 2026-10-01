import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../lib/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Investor Forum | Live Stock Trading Arena",
  description: "Real-time simulated stock market platform and trading competition engine.",
  icons: {
    icon: "/Logo.webp",
    apple: "/Logo.webp",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://txsvejwayjdfqzjtiqap.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://txsvejwayjdfqzjtiqap.supabase.co" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
      </head>
      <body
        className="min-h-full flex flex-col font-sans transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

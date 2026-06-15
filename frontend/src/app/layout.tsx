import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Energy Dignity Index | AI Platform by Kaushik Digital",
    template: "%s | EDI Platform",
  },
  description:
    "An AI platform that quantifies the true value of energy access — measuring human development, education, healthcare, and dignity impact. Built by Kaushik Digital.",
  keywords: [
    "Energy Dignity Index", "EDI", "Rural Electrification", "AI Platform",
    "Energy Access", "Human Development", "Climate Finance", "Kaushik Digital",
    "India Villages", "EDS Score", "Impact Investment",
  ],
  authors: [{ name: "Kaushik Digital", url: "https://kaushikdigital.com" }],
  creator: "Kaushik Digital",
  openGraph: {
    type: "website",
    title: "Energy Dignity Index — Measuring Human Progress Through Energy Access",
    description: "AI platform that quantifies the true value of energy access. Built by Kaushik Digital.",
    siteName: "EDI Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Energy Dignity Index by Kaushik Digital",
    description: "Measuring Human Progress Through Energy Access",
    creator: "@kaushikdigital",
  },
  robots: { index: true, follow: true },
  themeColor: "#050816",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased" style={{ background: "#050816" }}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0d1117",
                color: "#fff",
                border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#00FF88", secondary: "#050816" } },
              error:   { iconTheme: { primary: "#FF4757", secondary: "#050816" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

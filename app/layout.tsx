import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CleanCycle - Laundry Management System",
  description: "Smart laundry management system for apartments | Powered by Daniel Soos 2025",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CleanCycle",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning dir="ltr">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}


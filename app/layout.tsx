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
      { url: "/public/favicon/favicon.ico" },
      { url: "/public/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/public/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/public/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
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


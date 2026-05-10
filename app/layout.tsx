import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Budsjettplanlegger",
  description: "Bygg oversikt over økonomien din.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="no"
      className={`${dmSans.variable} ${dmMono.variable} h-full`}
    >
      {/* antialiased fjernet — håndteres av globals.css */}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
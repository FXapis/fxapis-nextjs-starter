import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fxapis Next.js starter",
  description: "Connect an MT5 account, view its positions and place a demo trade — built on the fxapis MetaTrader 5 REST API.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-black dark:bg-black dark:text-white">
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              fxapis <span className="font-normal text-black/40 dark:text-white/40">starter</span>
            </Link>
            <a href="https://docs.fxapis.com" target="_blank" rel="noopener" className="text-xs text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white">
              Docs ↗
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

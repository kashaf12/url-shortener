import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "URLShortener - Developer-First URL Shortening Platform",
  description:
    "Open-source, self-hostable URL shortener with React hooks, REST API, and enterprise features. Built for developers.",
  keywords: [
    "url shortener",
    "open source",
    "developer tools",
    "react hooks",
    "self hosted",
  ],
  authors: [{ name: "URLShortener Team" }],
  openGraph: {
    title: "URLShortener - Developer-First URL Shortening Platform",
    description:
      "Open-source, self-hostable URL shortener with React hooks, REST API, and enterprise features.",
    type: "website",
    url: "https://urlshortener.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "URLShortener - Developer-First URL Shortening Platform",
    description:
      "Open-source, self-hostable URL shortener with React hooks, REST API, and enterprise features.",
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

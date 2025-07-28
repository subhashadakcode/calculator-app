import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Calculator Pro+ | Professional PWA Calculator - Free Online & Offline",
  description:
    "🚀 Professional-grade PWA calculator with offline support, scientific functions, unit converter, currency converter, statistical calculations, and advanced features. Works online and offline. Install as native app!",
  keywords: [
    "calculator",
    "PWA calculator",
    "offline calculator",
    "scientific calculator",
    "professional calculator",
    "unit converter",
    "currency converter",
    "statistical calculator",
    "web calculator",
    "math calculator",
    "engineering calculator",
    "fast calculator",
    "responsive calculator",
    "free calculator",
    "online calculator",
    "mobile calculator",
    "desktop calculator",
  ],
  authors: [{ name: "Subhash Adak" }],
  creator: "Subhash Adak",
  publisher: "Calculator Pro+",
  applicationName: "Calculator Pro+",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#3b82f6" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://calculator-pro.vercel.app",
    title: "Calculator Pro+ | Professional PWA Calculator",
    description: "Professional-grade PWA calculator with offline support and advanced features",
    siteName: "Calculator Pro+",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Calculator Pro+ - Professional PWA Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculator Pro+ | Professional PWA Calculator",
    description: "Professional-grade PWA calculator with offline support and advanced features",
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
  verification: {
    google: "your-google-verification-code",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Calculator Pro+" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Calculator Pro+",
              description: "Professional PWA calculator with offline support and advanced features",
              url: "https://calculator-pro.vercel.app",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Subhash Adak",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

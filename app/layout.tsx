import type React from "react"
import "./globals.css"
import { Grandstander, Annie_Use_Your_Telescope, Fredoka } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const grandstander = Grandstander({
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-grandstander",
})

const annieUseYourTelescope = Annie_Use_Your_Telescope({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-annie",
})

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
})

export const metadata = {
  title: "The Googly Game",
  description: "Don't overthink it, just do the thing! Fun family challenges for everyone.",
  generator: "v0.dev",
  metadataBase: new URL("https://thegooglygame.com"), // Replace with your actual domain
  openGraph: {
    title: "The Googly Game",
    description: "Don't overthink it, just do the thing! Fun family challenges for everyone.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "The Googly Game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "The Googly Game",
    description: "Don't overthink it, just do the thing! Fun family challenges for everyone.",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-512.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body className={`${grandstander.variable} ${annieUseYourTelescope.variable} ${fredoka.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "GemRails Developer Portal",
  description:
    "Accept crypto, receive Naira instantly. API keys, webhooks, and SDK documentation for developers.",
  keywords: ["GemRails", "API", "SDK", "crypto payments", "webhooks", "developer"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

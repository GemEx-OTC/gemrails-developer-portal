"use client"

import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { CopyCommand } from "@/components/copy-command"

const footerLinks = {
  Documentation: [
    { label: "Quickstart", href: "#quickstart" },
    { label: "API Reference", href: "#docs" },
    { label: "Webhooks", href: "#webhooks" },
    { label: "SDK playground", href: "#sdk" },
  ],
  Product: [
    { label: "Pricing", href: "#pricing" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Get API keys", href: "/auth/signup" },
  ],
  Account: [
    { label: "Sign in", href: "/auth/login" },
    { label: "Register", href: "/auth/signup" },
  ],
}

export function DeveloperFooter() {
  return (
    <footer className="border-t border-[#1f2937] bg-card">
      <div className="dev-container py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <BrandLogo variant="small" size={36} />
              <span className="font-semibold text-foreground">
                GemRails <span className="text-emerald-400">Developers</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Crypto payments API with instant Naira settlement. Documentation, SDK, and
              integration tools for developers.
            </p>
            <div className="mt-4 max-w-md">
              <CopyCommand command="npm install @gemrails/sdk" />
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-emerald-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          id="pricing"
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#1f2937] pt-8 text-center text-sm text-gray-500 sm:flex-row sm:text-left"
        >
          <p>© {new Date().getFullYear()} GemRails. All rights reserved.</p>
          <p>developer.gemrails.com · API v1</p>
        </div>
      </div>
    </footer>
  )
}

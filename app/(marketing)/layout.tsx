import { CursorGlow } from "@/components/cursor-glow"
import { DeveloperHeader } from "@/components/developer-header"
import { DeveloperFooter } from "@/components/developer-footer"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
      <CursorGlow />
      <DeveloperHeader />
      <div className="flex-1">{children}</div>
      <DeveloperFooter />
    </div>
  )
}

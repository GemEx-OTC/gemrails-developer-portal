import { LandingHero } from "@/components/landing-hero"
import { SdkPlayground } from "@/components/sdk-playground"
import { ValuePropositions } from "@/components/value-propositions"
import { QuickstartDocs } from "@/components/quickstart-docs"

export default function LandingPage() {
  return (
    <main>
      <LandingHero />
      <SdkPlayground />
      <ValuePropositions />
      <QuickstartDocs />
    </main>
  )
}

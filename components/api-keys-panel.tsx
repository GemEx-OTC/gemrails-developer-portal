"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, KeyRound, Loader2, RefreshCw } from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import { RegenerateKeysModal } from "@/components/regenerate-keys-modal"
import { RevealSecretModal } from "@/components/reveal-secret-modal"
import { SuccessToast } from "@/components/success-toast"
import { WebhookSettings } from "@/components/webhook-settings"
import { fetchApiKeys, maskSecret, regenerateKeys } from "@/lib/api/keys"
import type { ApiKeyEnvironment, DeveloperApiKeys } from "@/lib/api/types"
import { setLocalOnboardingFlag } from "@/lib/onboarding-tasks"
import { cn } from "@/lib/utils"

const ENV_OPTIONS: { id: ApiKeyEnvironment; label: string; sub: string }[] = [
  { id: "sandbox", label: "Sandbox (Test)", sub: "pk_test / sk_test" },
  { id: "live", label: "Production (Live)", sub: "pk_live / sk_live" },
]

export function ApiKeysPanel() {
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>("sandbox")
  const [keys, setKeys] = useState<DeveloperApiKeys | null>(null)
  const [source, setSource] = useState<"api" | "mock">("mock")
  const [isLoading, setIsLoading] = useState(true)
  const [secretRevealed, setSecretRevealed] = useState(false)
  const [revealModalOpen, setRevealModalOpen] = useState(false)
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const loadKeys = useCallback(async (env: ApiKeyEnvironment) => {
    setIsLoading(true)
    setSecretRevealed(false)
    try {
      const result = await fetchApiKeys(env)
      setKeys(result.keys)
      setSource(result.source)
      if (env === "sandbox") {
        setLocalOnboardingFlag("sandbox_keys", true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadKeys(environment)
  }, [environment, loadKeys])

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const result = await regenerateKeys(environment)
      setKeys(result.keys)
      setSource(result.source)
      setSecretRevealed(true)
      setRegenerateModalOpen(false)
      const label = environment === "sandbox" ? "Sandbox" : "Production"
      setSuccessToast(`${label} API keys regenerated successfully.`)
      setTimeout(() => setSuccessToast(null), 5000)
    } catch {
      setSuccessToast("Failed to regenerate keys. Please try again.")
      setTimeout(() => setSuccessToast(null), 5000)
    } finally {
      setIsRegenerating(false)
    }
  }

  const displaySecret =
    keys && (secretRevealed ? keys.secretKey : maskSecret(keys.secretKey))

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">API Keys</h1>
          <p className="mt-1 text-muted-foreground">
            Manage sandbox and production credentials for the GemRails API.
          </p>
        </div>
        {keys && !isLoading && (
          <button
            type="button"
            onClick={() => setRegenerateModalOpen(true)}
            className="gemrails-button-outline inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </button>
        )}
      </div>

      <div className="inline-flex rounded-xl border border-[#1f2937] bg-[#111419] p-1">
        {ENV_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setEnvironment(opt.id)}
            disabled={isRegenerating}
            className={cn(
              "relative rounded-lg px-4 py-2.5 text-left transition-colors sm:px-6",
              environment === opt.id ? "text-emerald-400" : "text-gray-500 hover:text-gray-300",
              isRegenerating && "pointer-events-none opacity-60"
            )}
          >
            {environment === opt.id && (
              <motion.div
                layoutId="apiKeyEnvToggle"
                className="absolute inset-0 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative block text-sm font-semibold">{opt.label}</span>
            <span className="relative mt-0.5 block text-xs opacity-80">{opt.sub}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="gemrails-card flex min-h-[220px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : keys ? (
        <motion.div
          key={`${environment}-${keys.secretKey}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="gemrails-card">
            <div className="mb-3 flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-muted-foreground">Public key</label>
              <CopyButton value={keys.publicKey} />
            </div>
            <input
              readOnly
              value={keys.publicKey}
              className="gemrails-input font-mono text-sm text-emerald-400/95"
              aria-label="Public API key"
            />
            <p className="mt-2 text-xs text-gray-500">
              Safe for client-side and mobile apps — cannot initiate payouts alone.
            </p>
          </div>

          <div className="gemrails-card">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-medium text-muted-foreground">Secret key</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRegenerateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-400/90 transition-colors hover:bg-amber-500/10"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() =>
                    secretRevealed ? setSecretRevealed(false) : setRevealModalOpen(true)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  {secretRevealed ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Reveal
                    </>
                  )}
                </button>
                {secretRevealed && <CopyButton value={keys.secretKey} label="Copy secret" />}
              </div>
            </div>
            <input
              readOnly
              value={displaySecret ?? ""}
              className="gemrails-input font-mono text-sm tracking-wider text-gray-300"
              aria-label="Secret API key"
              type={secretRevealed ? "text" : "password"}
            />
            <p className="mt-2 text-xs text-gray-500">
              Server-side only. Rotate immediately if exposed.
            </p>
          </div>

          {source === "mock" && (
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <KeyRound className="h-3.5 w-3.5" />
              Sample keys until{" "}
              <code className="text-emerald-400/80">/api/v1/developer/keys</code> is live.
            </p>
          )}
        </motion.div>
      ) : null}

      <RevealSecretModal
        open={revealModalOpen}
        environment={environment}
        onClose={() => setRevealModalOpen(false)}
        onConfirm={() => setSecretRevealed(true)}
      />

      <RegenerateKeysModal
        open={regenerateModalOpen}
        environment={environment}
        isLoading={isRegenerating}
        onClose={() => !isRegenerating && setRegenerateModalOpen(false)}
        onConfirm={handleRegenerate}
      />

      <WebhookSettings environment={environment} onToast={setSuccessToast} />

      <SuccessToast
        message={successToast ?? ""}
        open={!!successToast}
        onClose={() => setSuccessToast(null)}
      />
    </div>
  )
}

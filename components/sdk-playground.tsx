"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Copy, Loader2, Play, Terminal } from "lucide-react"
import { CodeBlock } from "@/components/code-block"
import { SDK_TAB_EVENT, SDK_TAB_STORAGE_KEY } from "@/components/sdk-dropdown"
import {
  MOCK_API_RESPONSE,
  SDK_CODE_SAMPLES,
  SDK_TABS,
  type SdkLanguage,
} from "@/lib/sdk-playground-samples"
import { cn } from "@/lib/utils"

const VALID_LANGS = new Set<SdkLanguage>(["nodejs", "python", "curl", "go"])

function isSdkLanguage(value: string | null | undefined): value is SdkLanguage {
  return !!value && VALID_LANGS.has(value as SdkLanguage)
}

const TERMINAL_LINES = [
  { text: "$ gemrails simulate --env sandbox", delay: 0 },
  { text: "→ POST /v1/payments/initiate", delay: 400 },
  { text: "→ Resolving exchange rate (USDT/TRC20)...", delay: 900 },
  { text: "→ Generating per-transaction hot wallet...", delay: 1400 },
  { text: "", delay: 1900, json: true },
]

export function SdkPlayground() {
  const [activeTab, setActiveTab] = useState<SdkLanguage>("curl")
  const [copied, setCopied] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const [showJson, setShowJson] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const applyLanguage = useCallback((lang: SdkLanguage) => {
    setActiveTab(lang)
    setPulseKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get("lang")
    let stored: string | null = null
    try {
      stored = sessionStorage.getItem(SDK_TAB_STORAGE_KEY)
    } catch {
      stored = null
    }

    const initial = isSdkLanguage(fromUrl)
      ? fromUrl
      : isSdkLanguage(stored)
        ? stored
        : null

    if (initial) {
      applyLanguage(initial)
      try {
        sessionStorage.removeItem(SDK_TAB_STORAGE_KEY)
      } catch {
        // ignore
      }
    }

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<SdkLanguage>).detail
      if (isSdkLanguage(detail)) applyLanguage(detail)
    }
    window.addEventListener(SDK_TAB_EVENT, handler)
    return () => window.removeEventListener(SDK_TAB_EVENT, handler)
  }, [applyLanguage])

  const code = SDK_CODE_SAMPLES[activeTab]

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [code])

  const handleSimulate = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    setSimulating(true)
    setVisibleLines(0)
    setShowJson(false)

    TERMINAL_LINES.forEach((line, index) => {
      timersRef.current.push(
        setTimeout(() => {
          setVisibleLines(index + 1)
          if (line.json) setShowJson(true)
        }, line.delay)
      )
    })

    timersRef.current.push(
      setTimeout(() => {
        setSimulating(false)
      }, 2800)
    )
  }, [])

  return (
    <section id="sdk" className="scroll-mt-24 border-t border-border py-16 md:py-24">
      <div className="dev-container">
        <div className="mb-10 text-center md:mb-12">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Try the API in seconds
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Pick your language, copy the snippet, and see what a live initiation response looks
            like.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Code panel */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-2 pt-2">
              <div className="relative flex gap-1 overflow-x-auto">
                {SDK_TABS.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative z-10 shrink-0 px-4 py-2.5 text-sm font-medium transition-colors",
                        isActive ? "text-emerald-400" : "text-gray-500 hover:text-gray-300"
                      )}
                    >
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="sdkPlaygroundTab"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      {isActive && (
                        <motion.span
                          key={pulseKey}
                          initial={{ opacity: 0.6, scale: 0.85 }}
                          animate={{ opacity: 0, scale: 1.15 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          aria-hidden
                          className="pointer-events-none absolute inset-1 rounded-md bg-emerald-500/30"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="mb-1 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-gray-800/60 hover:text-white"
                aria-label="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="min-h-[280px] flex-1 bg-[#0d1117]"
              >
                <CodeBlock code={code} language={activeTab} />
              </motion.div>
            </AnimatePresence>

            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={handleSimulate}
                disabled={simulating}
                className="gemrails-button w-full gap-2 text-sm disabled:opacity-70 sm:w-auto"
              >
                {simulating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Simulating…
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Simulate API Call
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Terminal panel */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-[#0d1117]">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">Response</span>
              <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                sandbox
              </span>
            </div>

            <div className="min-h-[320px] flex-1 p-4 font-mono text-[13px] leading-relaxed lg:min-h-[380px]">
              {visibleLines === 0 && !simulating && (
                <p className="text-gray-600">
                  Click &quot;Simulate API Call&quot; to preview a sample response.
                </p>
              )}

              {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => {
                if (line.json && showJson) {
                  return (
                    <motion.pre
                      key="json"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 overflow-x-auto whitespace-pre-wrap text-teal-300/90"
                    >
                      {JSON.stringify(MOCK_API_RESPONSE, null, 2)}
                    </motion.pre>
                  )
                }
                if (line.json) return null
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "text-gray-400",
                      line.text.startsWith("→") && "text-emerald-400/80"
                    )}
                  >
                    {line.text}
                  </motion.div>
                )
              })}

              {simulating && visibleLines < TERMINAL_LINES.length && (
                <span className="mt-2 inline-block h-4 w-2 animate-pulse bg-emerald-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Building2, Check, ChevronDown, Loader2, Search, X } from "lucide-react"

interface Bank {
  name: string
  code: string
}

interface BankSelectorProps {
  value: string
  onChange: (bankCode: string, bankName: string) => void
  banks: Bank[]
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
}

export function BankSelector({
  value,
  onChange,
  banks = [],
  isLoading = false,
  placeholder = "Search for your bank...",
  disabled = false,
}: BankSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks
    const query = searchQuery.toLowerCase()
    return banks.filter(
      (bank) => bank.name.toLowerCase().includes(query) || bank.code.includes(query)
    )
  }, [banks, searchQuery])

  const selectedBank = useMemo(() => banks.find((b) => b.code === value), [banks, value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  const handleSelect = (bank: Bank) => {
    onChange(bank.code, bank.name)
    setIsOpen(false)
    setSearchQuery("")
  }

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.99 }}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
          disabled || isLoading
            ? "cursor-not-allowed border-gray-700 bg-gray-800/50"
            : "cursor-pointer border-gray-700 bg-gray-800/50 hover:bg-gray-800"
        } ${isOpen ? "border-emerald-500/50 ring-2 ring-emerald-500/50" : ""}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {isLoading ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-gray-500" />
          ) : (
            <Building2
              className={`h-5 w-5 shrink-0 ${selectedBank ? "text-emerald-400" : "text-gray-500"}`}
            />
          )}
          <span className={`truncate ${selectedBank ? "text-white" : "text-gray-400"}`}>
            {isLoading ? "Loading banks…" : selectedBank ? selectedBank.name : "Choose your bank"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedBank && !disabled && !isLoading && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onChange("", "")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation()
                  onChange("", "")
                }
              }}
              className="rounded-full p-1 transition-colors hover:bg-gray-700"
            >
              <X className="h-4 w-4 text-gray-500" />
            </span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-800 bg-[#12161c] shadow-2xl"
          >
            <div className="border-b border-gray-800 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-gray-800 bg-gray-900 py-2.5 pr-4 pl-10 text-sm text-white placeholder-gray-500 transition-colors focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto overscroll-contain">
              {filteredBanks.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Building2 className="mx-auto mb-2 h-10 w-10 text-gray-700" />
                  <p className="text-sm text-gray-500">No banks found</p>
                </div>
              ) : (
                <div className="py-1">
                  {filteredBanks.map((bank) => {
                    const isSelected = bank.code === value
                    return (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => handleSelect(bank)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected ? "bg-emerald-500/10" : "hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              isSelected ? "bg-emerald-500/20" : "bg-gray-800"
                            }`}
                          >
                            <Building2
                              className={`h-4 w-4 ${isSelected ? "text-emerald-400" : "text-gray-500"}`}
                            />
                          </div>
                          <p
                            className={`truncate text-sm font-medium ${
                              isSelected ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {bank.name}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-gray-800 bg-gray-900/50 px-4 py-2">
              <p className="text-xs text-gray-500">{filteredBanks.length} banks available</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

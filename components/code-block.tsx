"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

/** Lightweight syntax tinting — avoids extra highlighter deps */
function highlightLine(line: string, lang: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let key = 0

  if (lang === "curl") {
    const curlMatch = line.match(/^(\s*)(curl)(.*)$/)
    if (curlMatch) {
      parts.push(<span key={key++}>{curlMatch[1]}</span>)
      parts.push(
        <span key={key++} className="text-emerald-400">
          {curlMatch[2]}
        </span>
      )
      parts.push(<span key={key++} className="text-amber-200/90">{curlMatch[3]}</span>)
      return parts
    }
  }

  const stringRegex = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/g
  const keywordSet = new Set([
    "import",
    "from",
    "const",
    "let",
    "await",
    "async",
    "function",
    "return",
    "new",
    "package",
    "func",
    "main",
    "if",
    "err",
    "panic",
    "fmt",
    "print",
    "def",
    "class",
    "curl",
    "POST",
    "GET",
  ])

  let last = 0
  let match: RegExpExecArray | null
  while ((match = stringRegex.exec(line)) !== null) {
    const before = line.slice(last, match.index)
    if (before) {
      before.split(/(\b[\w.]+\b)/).forEach((chunk, i) => {
        if (!chunk) return
        if (keywordSet.has(chunk)) {
          parts.push(
            <span key={key++} className="text-emerald-400">
              {chunk}
            </span>
          )
        } else if (/^\d+$/.test(chunk)) {
          parts.push(
            <span key={key++} className="text-amber-300">
              {chunk}
            </span>
          )
        } else {
          parts.push(<span key={key++}>{chunk}</span>)
        }
      })
    }
    parts.push(
      <span key={key++} className="text-teal-300/90">
        {match[0]}
      </span>
    )
    last = match.index + match[0].length
  }

  const rest = line.slice(last)
  if (rest) {
    rest.split(/(\b[\w.]+\b)/).forEach((chunk) => {
      if (!chunk) return
      if (keywordSet.has(chunk)) {
        parts.push(
          <span key={key++} className="text-emerald-400">
            {chunk}
          </span>
        )
      } else if (/^\d+$/.test(chunk)) {
        parts.push(
          <span key={key++} className="text-amber-300">
            {chunk}
          </span>
        )
      } else {
        parts.push(<span key={key++}>{chunk}</span>)
      }
    })
  }

  if (parts.length === 0) {
    parts.push(<span key={0}>{line || " "}</span>)
  }

  return parts
}

interface CodeBlockProps {
  code: string
  language: string
  className?: string
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const lines = useMemo(() => code.split("\n"), [code])

  return (
    <pre
      className={cn(
        "overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-gray-300",
        className
      )}
    >
      <code>
        {lines.map((line, i) => (
          <div key={i} className="table-row">
            <span className="table-cell select-none pr-4 text-right text-xs text-gray-600">
              {i + 1}
            </span>
            <span className="table-cell">{highlightLine(line, language)}</span>
          </div>
        ))}
      </code>
    </pre>
  )
}

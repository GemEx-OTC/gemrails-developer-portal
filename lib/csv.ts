/** Convert array of records to CSV. Quoting follows RFC 4180. */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns?: { key: keyof T; header?: string }[]
): string {
  if (rows.length === 0) {
    return columns ? columns.map((c) => c.header ?? String(c.key)).join(",") : ""
  }

  const cols =
    columns ??
    (Object.keys(rows[0]) as (keyof T)[]).map((k) => ({ key: k, header: String(k) }))

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return ""
    const s = typeof v === "object" ? JSON.stringify(v) : String(v)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const header = cols.map((c) => escape(c.header ?? String(c.key))).join(",")
  const body = rows
    .map((row) => cols.map((c) => escape(row[c.key])).join(","))
    .join("\n")

  return `${header}\n${body}`
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === "undefined") return
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

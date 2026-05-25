/** Resolve API-relative or data URLs for profile images. */
export function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path
  }
  const apiBaseUrl = process.env.NEXT_PUBLIC_GEMRAILS_API_BASE_URL || "http://localhost:4000"
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${apiBaseUrl}${normalizedPath}`
}

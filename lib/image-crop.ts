/** Center-crop an image to a square JPEG data URL. */
export function cropImageToSquare(
  imageSrc: string,
  size = 256,
  scale = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas not supported"))
        return
      }
      const safeScale = Math.max(1, Math.min(scale, 3))
      const cropSize = Math.min(img.width, img.height) / safeScale
      const sx = (img.width - cropSize) / 2
      const sy = (img.height - cropSize) / 2
      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size)
      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = imageSrc
  })
}

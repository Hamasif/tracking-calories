/**
 * Kompres gambar di browser sebelum dikirim ke server/AI.
 * - Batasi sisi terpanjang (default 1024px)
 * - JPEG quality 0.82
 * Menghindari error batas 4MB body Next.js & hemat token vision.
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxSide = 1024,
  quality = 0.82
): Promise<string> {
  const dataUrl = await readAsDataUrl(file)

  try {
    const img = await loadImage(dataUrl)
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    if (scale >= 1 && file.size < 1_500_000) {
      // Sudah kecil, kirim apa adanya
      return dataUrl
    }

    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(img.width * scale))
    canvas.height = Math.max(1, Math.round(img.height * scale))
    const ctx = canvas.getContext("2d")
    if (!ctx) return dataUrl

    // Isi background putih (hindari hitam dari alpha JPEG)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const compressed = canvas.toDataURL("image/jpeg", quality)
    return compressed.length < dataUrl.length ? compressed : dataUrl
  } catch {
    // Fallback apa adanya kalau decode gagal
    return dataUrl
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
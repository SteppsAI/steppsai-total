import { toPng, toJpeg } from "html-to-image";
import { trpcClient } from "./trpc-client";
import type { ExportFormat } from "./carousel-templates";

const MAX_IMG_DIM = 1500;
const JPEG_QUALITY = 0.85;
const PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "carousel";
}

function downloadBlob(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function compressToJpeg(source: HTMLImageElement): string {
  const scale = Math.min(
    MAX_IMG_DIM / source.naturalWidth,
    MAX_IMG_DIM / source.naturalHeight,
    1
  );
  const w = Math.ceil(source.naturalWidth * scale);
  const h = Math.ceil(source.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(source, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/**
 * Prepare an <img> for export by resolving its src to a small JPEG data URI.
 *
 * - Data URIs: compress via canvas (PNG→JPEG, cap dimensions)
 * - Cross-origin URLs (CDN): fetch server-side via tRPC, then compress
 * - Same-origin URLs: skip — html-to-image handles them natively
 */
async function prepareImageForExport(
  img: HTMLImageElement
): Promise<string | null> {
  const src = img.src;
  if (!src) return null;

  // Data URI — compress if large
  if (src.startsWith("data:")) {
    if (!img.naturalWidth || !img.naturalHeight) return null;
    if (img.naturalWidth <= 200 && img.naturalHeight <= 200) return null;
    return compressToJpeg(img);
  }

  // HTTP(S) URL
  if (src.startsWith("http")) {
    // Same-origin → html-to-image handles it fine
    try {
      if (new URL(src).origin === window.location.origin) return null;
    } catch {
      return null;
    }

    // Cross-origin (CDN) → fetch server-side via tRPC, then compress
    const dataUri = await trpcClient.images.fetchAsDataUri.query({
      url: src,
    });
    const loaded = await loadImage(dataUri);
    return compressToJpeg(loaded);
  }

  return null;
}

export async function exportCarouselSlides(
  slideRefs: React.RefObject<HTMLDivElement | null>[],
  title: string,
  format: ExportFormat,
  onProgress?: (current: number, total: number) => void
) {
  const sanitized = sanitizeFilename(title);
  const ext = format === "png" ? "png" : "jpg";
  const total = slideRefs.length;

  for (let i = 0; i < total; i++) {
    const ref = slideRefs[i];
    if (!ref.current) continue;

    onProgress?.(i + 1, total);

    const node = ref.current;
    const convert = format === "png" ? toPng : toJpeg;
    const options =
      format === "png"
        ? { pixelRatio: 2, imagePlaceholder: PLACEHOLDER }
        : { quality: 0.95, pixelRatio: 2, imagePlaceholder: PLACEHOLDER };

    // Resolve + compress images so the SVG stays within browser limits
    const imgs = Array.from(node.querySelectorAll("img"));
    const swapped: Array<{ el: HTMLImageElement; originalSrc: string }> = [];

    await Promise.all(
      imgs.map(async (img) => {
        try {
          const compressed = await prepareImageForExport(img);
          if (compressed) {
            swapped.push({ el: img, originalSrc: img.src });
            img.src = compressed;
          }
        } catch {
          // Skip this image on any error
        }
      })
    );

    let dataUrl: string;
    try {
      dataUrl = await convert(node, options);
    } finally {
      for (const { el, originalSrc } of swapped) el.src = originalSrc;
    }

    downloadBlob(dataUrl, `${sanitized}-carousel-${i + 1}.${ext}`);
    if (i < total - 1) await delay(200);
  }
}

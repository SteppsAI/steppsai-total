import { toPng, toJpeg } from "html-to-image";
import type { ExportFormat } from "./carousel-templates";

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

    const convert = format === "png" ? toPng : toJpeg;
    const options =
      format === "png"
        ? { pixelRatio: 2 }
        : { quality: 0.95, pixelRatio: 2 };

    const dataUrl = await convert(ref.current, options);
    downloadBlob(dataUrl, `${sanitized}-carousel-${i + 1}.${ext}`);

    if (i < total - 1) {
      await delay(200);
    }
  }
}

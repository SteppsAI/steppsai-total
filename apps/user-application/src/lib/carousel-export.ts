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

function getProxiedUrl(url: string): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;

  if (url.startsWith('/')) return url;

  if (url.includes('localhost') || url.includes('127.0.0.1')) return url;

  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=png`;
}

async function imageToDataUrl(url: string): Promise<string> {
  const proxied = getProxiedUrl(url);
  try {
    const res = await fetch(proxied, { mode: 'cors', cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Retrying with cache bust...", error);
    try {
      const res = await fetch(`${proxied}&t=${Date.now()}`, { mode: 'cors' });
      if (!res.ok) throw res;
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error(`Failed to load image ${url}`, e);
      return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    }
  }
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

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  try {
    for (let i = 0; i < total; i++) {
      const ref = slideRefs[i];
      if (!ref.current) continue;

      onProgress?.(i + 1, total);

      const clone = ref.current.cloneNode(true) as HTMLElement;

      const images = clone.querySelectorAll("img");
      const processingPromises: Promise<void>[] = [];

      images.forEach((img) => {
        const originalSrc = img.getAttribute("src");
        if (originalSrc && !originalSrc.startsWith("data:")) {
          const p = imageToDataUrl(originalSrc).then(base64 => {
            img.setAttribute("src", base64);
            img.removeAttribute("crossorigin");
          });
          processingPromises.push(p);
        }
      });

      if (processingPromises.length > 0) {
        await Promise.all(processingPromises);
      }

      container.innerHTML = '';
      container.appendChild(clone);

      await delay(100);

      const convert = format === "png" ? toPng : toJpeg;
      const width = ref.current.offsetWidth;
      const height = ref.current.offsetHeight;

      const options =
        format === "png"
          ? {
            pixelRatio: 3,
            skipAutoScale: true,
            width,
            height,
            cacheBust: true,
          }
          : {
            quality: 1.0,
            pixelRatio: 3,
            skipAutoScale: true,
            width,
            height,
            cacheBust: true,
          };

      const dataUrl = await convert(clone, options);
      downloadBlob(dataUrl, `${sanitized}-carousel-${i + 1}.${ext}`);

      if (i < total - 1) await delay(200);
    }
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

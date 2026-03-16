/**
 * Blog Image Optimizer
 * Automatically resizes, converts to WEBP, and compresses images
 */

interface OptimizeOptions {
  maxWidth: number;
  maxHeight?: number;
  quality: number;
  maxSizeKB: number;
}

const PRESETS = {
  featured: { maxWidth: 1200, maxHeight: 675, quality: 0.82, maxSizeKB: 300 } as OptimizeOptions,
  content: { maxWidth: 800, quality: 0.80, maxSizeKB: 120 } as OptimizeOptions,
  thumbnail: { maxWidth: 400, maxHeight: 300, quality: 0.78, maxSizeKB: 80 } as OptimizeOptions,
};

export type ImagePreset = keyof typeof PRESETS;

/**
 * Generate SEO-friendly filename from article title
 */
export function generateSeoFilename(title: string, prefix?: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

  const path = prefix ? `${prefix}/` : '';
  return `${path}${slug}-${Date.now()}.webp`;
}

/**
 * Generate alt text from article title
 */
export function generateAltText(title: string): string {
  return title.trim();
}

/**
 * Load an image file into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * Resize and convert image to WEBP blob with target quality
 */
function canvasToBlob(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number | undefined,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');

    let { naturalWidth: w, naturalHeight: h } = img;

    // If fixed aspect ratio (featured/thumbnail), crop to fit
    if (maxHeight) {
      const targetRatio = maxWidth / maxHeight;
      const srcRatio = w / h;

      let cropW = w, cropH = h;
      if (srcRatio > targetRatio) {
        cropW = Math.round(h * targetRatio);
      } else {
        cropH = Math.round(w / targetRatio);
      }

      const offX = Math.round((w - cropW) / 2);
      const offY = Math.round((h - cropH) / 2);

      canvas.width = Math.min(maxWidth, cropW);
      canvas.height = Math.min(maxHeight, cropH);

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, offX, offY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    } else {
      // Proportional resize (content images)
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
    }

    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/webp',
      quality
    );
  });
}

/**
 * Optimize an image file according to a preset
 * Returns a WEBP File ready for upload
 */
export async function optimizeImage(
  file: File,
  preset: ImagePreset,
  title?: string
): Promise<{ file: File; altText: string }> {
  const opts = PRESETS[preset];
  const img = await loadImage(file);

  // Try with initial quality, reduce if too large
  let quality = opts.quality;
  let blob = await canvasToBlob(img, opts.maxWidth, opts.maxHeight, quality);

  // Iteratively reduce quality if file exceeds max size
  let attempts = 0;
  while (blob.size > opts.maxSizeKB * 1024 && quality > 0.3 && attempts < 5) {
    quality -= 0.1;
    blob = await canvasToBlob(img, opts.maxWidth, opts.maxHeight, quality);
    attempts++;
  }

  // Clean up object URL
  URL.revokeObjectURL(img.src);

  const fileName = title
    ? generateSeoFilename(title, preset === 'featured' ? 'featured' : undefined)
    : `${preset}-${Date.now()}.webp`;

  const optimizedFile = new File([blob], fileName, { type: 'image/webp' });
  const altText = title ? generateAltText(title) : file.name.replace(/\.[^.]+$/, '');

  return { file: optimizedFile, altText };
}

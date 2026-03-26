/**
 * Utilities for image processing and optimization.
 */

/**
 * Optimizes an image file by resizing and compressing it.
 * Forces the output to JPEG format for better compression.
 *
 * NOTE: All event handlers are assigned before FileReader starts
 * to avoid a race condition where img.onload fires after img.src
 * is set (possible when the browser has the data cached).
 */
export async function optimizeImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<Blob> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    // Wire up all img handlers BEFORE we set src (prevents missing onload on cache hit)
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create image blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Could not load image: the file may be corrupt or unsupported'));
    };

    // Use onloadend (fires for both success and error) to wire FileReader → img
    reader.onloadend = () => {
      if (reader.result) {
        img.src = reader.result as string;
      } else {
        reject(new Error('Could not read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Downloads an image from a URL by fetching it as a blob and triggering a
 * browser download. Falls back to opening the URL directly if fetch fails
 * (e.g. due to CORS restrictions on private buckets).
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    // mode: 'cors' — Supabase public buckets support CORS for GET requests
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Small delay before revoking so the browser has time to start the download
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  } catch (error) {
    console.warn('Blob download failed, falling back to new tab:', error);
    // Fallback: open in new tab so the user can save manually
    window.open(url, '_blank');
  }
}

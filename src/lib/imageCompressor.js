/**
 * Compresses an image File or Data URL to a lightweight Base64 string (under 100KB)
 * using HTML Canvas to prevent localStorage QuotaExceededError and ensure instant cloud sync.
 */
export function compressImage(fileOrDataUrl, maxWidth = 900, maxHeight = 900, quality = 0.7) {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) {
      resolve(null);
      return;
    }

    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate scaled dimensions maintaining aspect ratio
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
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compact JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Fallback if image fails to load in canvas
      resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null);
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      resolve(null);
    }
  });
}

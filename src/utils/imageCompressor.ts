/**
 * Client-side image compressor for mobile cameras and gallery uploads.
 * Ensures images are resized to maximum dimensions and compressed to under 1MB,
 * with robust fallback handling to prevent black canvas corruption.
 */
export async function compressImage(file: File, maxDimension = 1280, quality = 0.8): Promise<{ dataUrl: string; sizeKb: number }> {
  try {
    let bitmap: ImageBitmap | null = null;
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      try {
        bitmap = await createImageBitmap(file);
      } catch (err) {
        console.warn('createImageBitmap failed, falling back to FileReader:', err);
      }
    }

    if (bitmap) {
      let width = bitmap.width;
      let height = bitmap.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);

      let currentQuality = quality;
      let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

      while (dataUrl.length > 1024 * 1024 * 1.33 && currentQuality > 0.3) {
        currentQuality -= 0.15;
        dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
      }

      const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
      return { dataUrl, sizeKb };
    }

    // Fallback FileReader + Image
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to create canvas context'));
            return;
          }

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let currentQuality = quality;
          let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

          while (dataUrl.length > 1024 * 1024 * 1.33 && currentQuality > 0.3) {
            currentQuality -= 0.15;
            dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          }

          const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          resolve({ dataUrl, sizeKb });
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.error('Image compression error, using raw base64 fallback:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, sizeKb });
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Automatically removes black background pixels from school logo/crest images using canvas image data processing.
 */
export function removeBlackBackground(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    if (!imageSrc) {
      resolve(imageSrc);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If pixel is dark/black background, make transparent
          if (r < 50 && g < 50 && b < 50) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

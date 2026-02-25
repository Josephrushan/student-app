import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

/**
 * Compress image file (similar to WhatsApp/Facebook compression)
 * Reduces file size by up to 80-90% while maintaining reasonable quality
 */
export const compressImage = async (file: File, options?: CompressionOptions): Promise<File> => {
  try {
    const compressionOptions = {
      maxSizeMB: options?.maxSizeMB || 0.5, // 500KB target
      maxWidthOrHeight: options?.maxWidthOrHeight || 1080, // Max 1080px dimension
      useWebWorker: options?.useWebWorker !== false,
      // Quality: 0.8 gives good balance between size and visual quality
    };

    console.log(`🗜️ Starting compression: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    const compressedFile = await imageCompression(file, compressionOptions);
    
    const originalSize = file.size / 1024 / 1024;
    const compressedSize = compressedFile.size / 1024 / 1024;
    const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    
    console.log(`✅ Compression complete: ${originalSize.toFixed(2)}MB → ${compressedSize.toFixed(2)}MB (${reduction}% reduction)`);
    
    return new File([compressedFile], file.name, { type: 'image/jpeg' });
  } catch (error) {
    console.error('Image compression failed, using original:', error);
    return file;
  }
};

/**
 * Compress multiple images (for batch operations)
 */
export const compressImages = async (files: File[], options?: CompressionOptions): Promise<File[]> => {
  try {
    const compressed = await Promise.all(
      files.map(file => compressImage(file, options))
    );
    return compressed;
  } catch (error) {
    console.error('Batch compression failed:', error);
    return files;
  }
};

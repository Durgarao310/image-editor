/**
 * Image Utility Functions
 * Helper functions for image validation, formatting, and manipulation
 */

import { config } from '@/lib/config';
import type { SupportedInputFormat, SupportedOutputFormat } from '@/types/image.types';

/**
 * Validate image buffer
 * 
 * @param buffer - Image buffer to validate
 * @throws Error if buffer is invalid
 */
export function validateImageBuffer(buffer: Buffer): void {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid image buffer');
  }

  if (buffer.length === 0) {
    throw new Error('Empty image buffer');
  }

  if (buffer.length > config.image.maxFileSize) {
    throw new Error(
      `File size exceeds maximum allowed size of ${formatBytes(config.image.maxFileSize)}`
    );
  }

  // Check magic numbers for common formats
  const signature = buffer.toString('hex', 0, 4);
  const validSignatures = [
    'ffd8ff', // JPEG
    '89504e', // PNG
    '47494638', // GIF
    '52494646', // WEBP (RIFF)
    '424d', // BMP
    '49492a00', // TIFF (little-endian)
    '4d4d002a', // TIFF (big-endian)
  ];

  const isValid = validSignatures.some((sig) => signature.startsWith(sig));

  if (!isValid && !buffer.toString('utf8', 0, 5).includes('<?xml')) {
    throw new Error('Invalid or unsupported image format');
  }
}

/**
 * Get MIME type from format
 * 
 * @param format - Image format
 * @returns MIME type string
 */
export function getMimeType(format: SupportedOutputFormat): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    tiff: 'image/tiff',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
  };

  return mimeTypes[format] || 'application/octet-stream';
}

/**
 * Get file extension from format
 * 
 * @param format - Image format
 * @returns File extension
 */
export function getFileExtension(format: SupportedOutputFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}

/**
 * Format bytes to human-readable string
 * 
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Check if format is supported for input
 * 
 * @param format - Format to check
 * @returns True if supported
 */
export function isSupportedInputFormat(format: string): format is SupportedInputFormat {
  const supported: SupportedInputFormat[] = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'avif',
    'bmp',
    'tiff',
    'gif',
    'svg',
  ];
  return supported.includes(format as SupportedInputFormat);
}

/**
 * Check if format is supported for output
 * 
 * @param format - Format to check
 * @returns True if supported
 */
export function isSupportedOutputFormat(format: string): format is SupportedOutputFormat {
  const supported: SupportedOutputFormat[] = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'avif',
    'pdf',
    'svg',
  ];
  return supported.includes(format as SupportedOutputFormat);
}

/**
 * Sanitize filename to prevent path traversal
 * 
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Generate unique filename
 * 
 * @param originalName - Original filename
 * @param format - Output format
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string, format: SupportedOutputFormat): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitized = sanitizeFilename(nameWithoutExt);
  const extension = getFileExtension(format);

  return `${sanitized}_${timestamp}_${random}.${extension}`;
}

/**
 * Parse multipart form data filename
 * 
 * @param filename - Form data filename
 * @returns Parsed filename
 */
export function parseFilename(filename: string | undefined): string {
  if (!filename) return 'image';

  // Remove path and sanitize
  const name = filename.split(/[/\\]/).pop() || 'image';
  return sanitizeFilename(name);
}

/**
 * Calculate aspect ratio
 * 
 * @param width - Image width
 * @param height - Image height
 * @returns Aspect ratio as string (e.g., "16:9")
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);

  return `${width / divisor}:${height / divisor}`;
}

/**
 * Calculate dimensions maintaining aspect ratio
 * 
 * @param originalWidth - Original width
 * @param originalHeight - Original height
 * @param targetWidth - Target width (optional)
 * @param targetHeight - Target height (optional)
 * @returns Calculated dimensions
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  if (!targetWidth && !targetHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  }

  if (!targetWidth && targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  }

  // Both specified - maintain aspect ratio
  const targetAspectRatio = (targetWidth || 1) / (targetHeight || 1);

  if (aspectRatio > targetAspectRatio) {
    return {
      width: targetWidth || originalWidth,
      height: Math.round((targetWidth || originalWidth) / aspectRatio),
    };
  } else {
    return {
      width: Math.round((targetHeight || originalHeight) * aspectRatio),
      height: targetHeight || originalHeight,
    };
  }
}

/**
 * Validate dimensions against maximum allowed
 * 
 * @param width - Width to validate
 * @param height - Height to validate
 * @throws Error if dimensions exceed maximum
 */
export function validateDimensions(width?: number, height?: number): void {
  const maxDim = config.image.maxDimension;

  if (width && width > maxDim) {
    throw new Error(`Width exceeds maximum dimension of ${maxDim}px`);
  }

  if (height && height > maxDim) {
    throw new Error(`Height exceeds maximum dimension of ${maxDim}px`);
  }
}

/**
 * Detect format from buffer magic numbers
 * 
 * @param buffer - Image buffer
 * @returns Detected format or null
 */
export function detectFormat(buffer: Buffer): SupportedInputFormat | null {
  const signature = buffer.toString('hex', 0, 12);

  if (signature.startsWith('ffd8ff')) return 'jpg';
  if (signature.startsWith('89504e47')) return 'png';
  if (signature.startsWith('47494638')) return 'gif';
  if (signature.startsWith('52494646') && buffer.toString('utf8', 8, 12) === 'WEBP') return 'webp';
  if (signature.startsWith('424d')) return 'bmp';
  if (signature.startsWith('49492a00') || signature.startsWith('4d4d002a')) return 'tiff';

  // Check for SVG
  const start = buffer.toString('utf8', 0, 100);
  if (start.includes('<?xml') || start.includes('<svg')) return 'svg';

  return null;
}

/**
 * Create error response
 * 
 * @param message - Error message
 * @param details - Additional error details
 * @returns Error response object
 */
export function createErrorResponse(message: string, details?: unknown) {
  return {
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create success response
 * 
 * @param data - Response data
 * @returns Success response object
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

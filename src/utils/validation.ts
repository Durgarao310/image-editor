/**
 * Input Validation Utilities
 * Security-focused validation for file uploads and user inputs
 */

import { logger } from './logger';

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/bmp',
  'image/tiff',
] as const;

/**
 * Maximum file size in bytes (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validate file type and size
 * @throws Error if validation fails
 */
export function validateImageFile(file: File): void {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    logger.warn('Invalid file type attempted', { 
      type: file.type, 
      name: file.name 
    });
    throw new Error(
      `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    logger.warn('File too large attempted', { 
      size: file.size, 
      name: file.name 
    });
    throw new Error(
      `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 50MB`
    );
  }

  // Validate file name
  if (!file.name || file.name.length > 255) {
    throw new Error('Invalid file name');
  }
}

/**
 * Sanitize filename to prevent path traversal attacks
 * Removes dangerous characters and patterns
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'image';

  return filename
    .trim()
    // Remove path separators
    .replace(/[/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove dangerous characters
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Remove leading dots (hidden files)
    .replace(/^\.+/, '')
    // Remove multiple consecutive dots
    .replace(/\.{2,}/g, '.')
    // Limit length
    .slice(0, 255)
    // Ensure not empty after sanitization
    || 'image';
}

/**
 * Validate and sanitize custom filename input
 */
export function validateCustomFilename(filename: string): string {
  const sanitized = sanitizeFilename(filename);
  
  // Check for reserved names (Windows)
  const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 
                    'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 
                    'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  
  const nameWithoutExt = sanitized.split('.')[0].toUpperCase();
  if (reserved.includes(nameWithoutExt)) {
    return 'image';
  }

  return sanitized;
}

/**
 * Validate dimension values
 */
export function validateDimensions(width?: number, height?: number): void {
  if (width !== undefined) {
    if (!Number.isInteger(width) || width < 1 || width > 10000) {
      throw new Error('Width must be between 1 and 10000 pixels');
    }
  }

  if (height !== undefined) {
    if (!Number.isInteger(height) || height < 1 || height > 10000) {
      throw new Error('Height must be between 1 and 10000 pixels');
    }
  }
}

/**
 * Validate quality value
 */
export function validateQuality(quality?: number): void {
  if (quality !== undefined) {
    if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
      throw new Error('Quality must be between 1 and 100');
    }
  }
}

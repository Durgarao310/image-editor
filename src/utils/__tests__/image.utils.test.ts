/**
 * Image Utility Functions Tests
 */

import {
  validateImageBuffer,
  getMimeType,
  getFileExtension,
  formatBytes,
  isSupportedInputFormat,
  isSupportedOutputFormat,
  sanitizeFilename,
  generateUniqueFilename,
  calculateAspectRatio,
  calculateDimensions,
  validateDimensions,
  detectFormat,
  createErrorResponse,
  createSuccessResponse,
} from '@/utils/image.utils';
import sharp from 'sharp';

describe('Image Utils', () => {
  let validImageBuffer: Buffer;

  beforeAll(async () => {
    validImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();
  });

  describe('validateImageBuffer', () => {
    it('should validate correct buffer', () => {
      expect(() => validateImageBuffer(validImageBuffer)).not.toThrow();
    });

    it('should throw error for invalid buffer', () => {
      expect(() => validateImageBuffer(null as unknown as Buffer)).toThrow('Invalid image buffer');
    });

    it('should throw error for empty buffer', () => {
      expect(() => validateImageBuffer(Buffer.from([]))).toThrow('Empty image buffer');
    });

    it('should throw error for non-buffer input', () => {
      expect(() => validateImageBuffer('not a buffer' as unknown as Buffer)).toThrow('Invalid image buffer');
    });
  });

  describe('getMimeType', () => {
    it('should return correct MIME type for jpg', () => {
      expect(getMimeType('jpg')).toBe('image/jpeg');
    });

    it('should return correct MIME type for png', () => {
      expect(getMimeType('png')).toBe('image/png');
    });

    it('should return correct MIME type for webp', () => {
      expect(getMimeType('webp')).toBe('image/webp');
    });

    it('should return correct MIME type for pdf', () => {
      expect(getMimeType('pdf')).toBe('application/pdf');
    });

    it('should return default for unknown format', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getMimeType('unknown' as any)).toBe('application/octet-stream');
    });
  });

  describe('getFileExtension', () => {
    it('should return jpg for jpeg', () => {
      expect(getFileExtension('jpeg')).toBe('jpg');
    });

    it('should return same extension for other formats', () => {
      expect(getFileExtension('png')).toBe('png');
      expect(getFileExtension('webp')).toBe('webp');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should respect decimal places', () => {
      expect(formatBytes(1536, 0)).toContain('KB');
      expect(formatBytes(1536, 2)).toContain('KB');
    });
  });

  describe('isSupportedInputFormat', () => {
    it('should return true for supported formats', () => {
      expect(isSupportedInputFormat('jpg')).toBe(true);
      expect(isSupportedInputFormat('png')).toBe(true);
      expect(isSupportedInputFormat('webp')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isSupportedInputFormat('xyz')).toBe(false);
      expect(isSupportedInputFormat('doc')).toBe(false);
    });
  });

  describe('isSupportedOutputFormat', () => {
    it('should return true for supported output formats', () => {
      expect(isSupportedOutputFormat('jpg')).toBe(true);
      expect(isSupportedOutputFormat('png')).toBe(true);
      expect(isSupportedOutputFormat('pdf')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isSupportedOutputFormat('gif')).toBe(false);
      expect(isSupportedOutputFormat('bmp')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filename', () => {
      expect(sanitizeFilename('file name.jpg')).toBe('file_name.jpg');
      expect(sanitizeFilename('file/path\\name.jpg')).toBe('file_path_name.jpg');
    });

    it('should replace multiple underscores', () => {
      expect(sanitizeFilename('file___name.jpg')).toBe('file_name.jpg');
    });

    it('should truncate long filenames', () => {
      const longName = 'a'.repeat(300);
      expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate unique filename', () => {
      const filename1 = generateUniqueFilename('test.jpg', 'webp');
      const filename2 = generateUniqueFilename('test.jpg', 'webp');

      expect(filename1).toContain('test_');
      expect(filename1).toContain('.webp');
      expect(filename1).not.toBe(filename2);
    });

    it('should use correct extension', () => {
      const filename = generateUniqueFilename('image.png', 'jpg');
      expect(filename).toContain('.jpg');
    });
  });

  describe('calculateAspectRatio', () => {
    it('should calculate aspect ratio correctly', () => {
      expect(calculateAspectRatio(1920, 1080)).toBe('16:9');
      expect(calculateAspectRatio(1000, 1000)).toBe('1:1');
      expect(calculateAspectRatio(4, 3)).toBe('4:3');
    });
  });

  describe('calculateDimensions', () => {
    it('should return original dimensions if no target specified', () => {
      const result = calculateDimensions(100, 100);
      expect(result).toEqual({ width: 100, height: 100 });
    });

    it('should calculate height from width', () => {
      const result = calculateDimensions(100, 50, 200);
      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it('should calculate width from height', () => {
      const result = calculateDimensions(100, 50, undefined, 100);
      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it('should maintain aspect ratio with both dimensions', () => {
      const result = calculateDimensions(100, 50, 200, 200);
      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });
  });

  describe('validateDimensions', () => {
    it('should not throw for valid dimensions', () => {
      expect(() => validateDimensions(1000, 1000)).not.toThrow();
    });

    it('should throw for dimensions exceeding maximum', () => {
      expect(() => validateDimensions(20000)).toThrow();
      expect(() => validateDimensions(undefined, 20000)).toThrow();
    });
  });

  describe('detectFormat', () => {
    it('should detect PNG format', async () => {
      const pngBuffer = await sharp({
        create: { width: 10, height: 10, channels: 3, background: { r: 0, g: 0, b: 0 } },
      })
        .png()
        .toBuffer();

      expect(detectFormat(pngBuffer)).toBe('png');
    });

    it('should detect JPEG format', async () => {
      const jpegBuffer = await sharp({
        create: { width: 10, height: 10, channels: 3, background: { r: 0, g: 0, b: 0 } },
      })
        .jpeg()
        .toBuffer();

      expect(detectFormat(jpegBuffer)).toBe('jpg');
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response', () => {
      const response = createErrorResponse('Test error', { code: 500 });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Test error');
      expect(response.details).toEqual({ code: 500 });
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response', () => {
      const data = { result: 'success' };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
    });
  });
});

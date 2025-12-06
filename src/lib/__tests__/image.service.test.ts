/**
 * Image Service Tests
 * Comprehensive unit tests for ImageService
 */

import { ImageService } from '@/lib/image.service';
import sharp from 'sharp';
import { ConvertImageRequest, ResizeImageRequest, OptimizeImageRequest } from '@/types/image.types';

describe('ImageService', () => {
  let imageService: ImageService;
  let testImageBuffer: Buffer;

  beforeAll(async () => {
    imageService = new ImageService();

    // Create a test image buffer (500x500 red square)
    testImageBuffer = await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();
  });

  describe('convertImage', () => {
    it('should convert image to WebP format', async () => {
      const options: ConvertImageRequest = {
        format: 'webp',
        quality: 80,
      };

      const result = await imageService.convertImage(testImageBuffer, options);

      expect(result.format).toBe('webp');
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.size).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should convert image to JPEG format', async () => {
      const options: ConvertImageRequest = {
        format: 'jpg',
        quality: 90,
      };

      const result = await imageService.convertImage(testImageBuffer, options);

      expect(result.format).toBe('jpg');
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it('should strip metadata when requested', async () => {
      const options: ConvertImageRequest = {
        format: 'png',
        stripMetadata: true,
      };

      const result = await imageService.convertImage(testImageBuffer, options);

      expect(result.metadata.exif).toBeUndefined();
    });

    it('should throw error for invalid buffer', async () => {
      const invalidBuffer = Buffer.from('not an image');
      const options: ConvertImageRequest = {
        format: 'webp',
      };

      await expect(imageService.convertImage(invalidBuffer, options)).rejects.toThrow();
    });

    it('should respect quality settings', async () => {
      const highQuality: ConvertImageRequest = {
        format: 'jpg',
        quality: 95,
      };

      const lowQuality: ConvertImageRequest = {
        format: 'jpg',
        quality: 50,
      };

      const highResult = await imageService.convertImage(testImageBuffer, highQuality);
      const lowResult = await imageService.convertImage(testImageBuffer, lowQuality);

      expect(highResult.size).toBeGreaterThan(lowResult.size);
    });
  });

  describe('resizeImage', () => {
    it('should resize image to specified dimensions', async () => {
      const options: ResizeImageRequest = {
        width: 50,
        height: 50,
        fit: 'cover',
      };

      const result = await imageService.resizeImage(testImageBuffer, options);

      expect(result.metadata.width).toBe(50);
      expect(result.metadata.height).toBe(50);
    });

    it('should resize with width only (maintain aspect ratio)', async () => {
      const options: ResizeImageRequest = {
        width: 50,
        fit: 'inside',
      };

      const result = await imageService.resizeImage(testImageBuffer, options);

      expect(result.metadata.width).toBe(50);
      expect(result.metadata.height).toBe(50); // Square image
    });

    it('should rotate image', async () => {
      const options: ResizeImageRequest = {
        rotate: 90,
      };

      const result = await imageService.resizeImage(testImageBuffer, options);

      // After 90-degree rotation of 500x500, dimensions should remain 500x500
      expect(result.metadata.width).toBe(500);
      expect(result.metadata.height).toBe(500);
    });

    it('should flip image horizontally', async () => {
      const options: ResizeImageRequest = {
        flipHorizontal: true,
      };

      const result = await imageService.resizeImage(testImageBuffer, options);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.metadata.width).toBe(500);
    });

    it('should flip image vertically', async () => {
      const options: ResizeImageRequest = {
        flipVertical: true,
      };

      const result = await imageService.resizeImage(testImageBuffer, options);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.metadata.height).toBe(500);
    });

    it('should apply multiple transformations', async () => {
      const options: ResizeImageRequest = {
        width: 50,
        height: 50,
        rotate: 45,
        flipHorizontal: true,
        optimizeForWeb: true,
      };

      const result = await imageService.resizeImage(testImageBuffer, options);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe('extractMetadata', () => {
    it('should extract basic metadata', async () => {
      const metadata = await imageService.extractMetadata(testImageBuffer, {
        includeExif: true,
      });

      expect(metadata.width).toBe(500);
      expect(metadata.height).toBe(500);
      expect(metadata.format).toBe('png');
      expect(metadata.channels).toBeGreaterThan(0);
    });

    it('should extract metadata without EXIF', async () => {
      const metadata = await imageService.extractMetadata(testImageBuffer, {
        includeExif: false,
      });

      expect(metadata.width).toBe(500);
      expect(metadata.exif).toBeUndefined();
    });

    it('should include file size', async () => {
      const metadata = await imageService.extractMetadata(testImageBuffer);

      expect(metadata.size).toBe(testImageBuffer.length);
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata fields', async () => {
      const updates = {
        title: 'Test Image',
        description: 'A test image',
        author: 'Test Author',
        copyright: '© 2025',
      };

      const result = await imageService.updateMetadata(testImageBuffer, updates);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should strip existing metadata', async () => {
      const updates = {
        stripExisting: true,
      };

      const result = await imageService.updateMetadata(testImageBuffer, updates);

      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('optimizeImage', () => {
    it('should optimize image with default settings', async () => {
      const options: OptimizeImageRequest = {
        quality: 80,
      };

      const result = await imageService.optimizeImage(testImageBuffer, options);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.size).toBeLessThanOrEqual(testImageBuffer.length);
    });

    it('should optimize and reduce file size', async () => {
      const options: OptimizeImageRequest = {
        quality: 60,
        stripMetadata: true,
      };

      const result = await imageService.optimizeImage(testImageBuffer, options);

      expect(result.size).toBeLessThan(testImageBuffer.length);
    });

    it('should optimize to target file size', async () => {
      const targetSize = 5000; // 5KB
      const options: OptimizeImageRequest = {
        maxFileSize: targetSize,
        quality: 80,
      };

      const result = await imageService.optimizeImage(testImageBuffer, options);

      // Allow some tolerance
      expect(result.size).toBeLessThanOrEqual(targetSize * 1.1);
    });

    it('should use binary search for optimization', async () => {
      // Create a large noise image that is hard to compress
      const width = 2000;
      const height = 2000;
      const channels = 3;
      const size = width * height * channels;
      const rawBuffer = Buffer.alloc(size);

      // Fill with random noise
      for (let i = 0; i < size; i++) {
        rawBuffer[i] = Math.floor(Math.random() * 256);
      }

      const difficultImage = await sharp(rawBuffer, {
        raw: {
          width,
          height,
          channels
        }
      })
        .jpeg()
        .toBuffer();

      const targetSize = Math.floor(difficultImage.length * 0.7); // Target 70% of original
      const startTime = Date.now();

      const result = await imageService.optimizeImage(difficultImage, {
        maxFileSize: targetSize,
        quality: 100,
        format: 'jpg',
      });

      const duration = Date.now() - startTime;

      // Should meet target size
      expect(result.size).toBeLessThanOrEqual(targetSize);
      // Binary search should be reasonably fast
      expect(duration).toBeLessThan(10000); // 10s budget for large image processing
    });

    it('should handle lossless optimization', async () => {
      const options: OptimizeImageRequest = {
        lossless: true,
        format: 'png',
      };

      const result = await imageService.optimizeImage(testImageBuffer, options);

      expect(result.format).toBe('png');
    });
  });

  describe('generateThumbnail', () => {
    it('should generate small thumbnail', async () => {
      const result = await imageService.generateThumbnail(testImageBuffer, 'small');

      expect(result.metadata.width).toBe(256);
      expect(result.metadata.height).toBe(256);
    });

    it('should generate medium thumbnail', async () => {
      const result = await imageService.generateThumbnail(testImageBuffer, 'medium');

      expect(result.metadata.width).toBe(512);
      expect(result.metadata.height).toBe(512);
    });

    it('should generate large thumbnail', async () => {
      const result = await imageService.generateThumbnail(testImageBuffer, 'large');

      expect(result.metadata.width).toBe(1024);
      expect(result.metadata.height).toBe(1024);
    });

    it('should throw error for invalid preset', async () => {
      await expect(
        imageService.generateThumbnail(testImageBuffer, 'invalid' as 'small' | 'medium' | 'large')
      ).rejects.toThrow();
    });
  });

  describe('addWatermark', () => {
    it('should add text watermark', async () => {
      const watermarkConfig = {
        type: 'text' as const,
        text: '© 2025',
        position: 'southeast' as const,
        opacity: 0.5,
      };

      const result = await imageService.addWatermark(testImageBuffer, watermarkConfig);

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should add text watermark with custom styling', async () => {
      const watermarkConfig = {
        type: 'text' as const,
        text: 'WATERMARK',
        fontSize: 64,
        fontColor: 'rgba(255, 255, 255, 0.7)',
        position: 'center' as const,
      };

      const result = await imageService.addWatermark(testImageBuffer, watermarkConfig);

      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('batchProcess', () => {
    it('should process multiple images', async () => {
      const buffers = [testImageBuffer, testImageBuffer, testImageBuffer];
      const params: ConvertImageRequest = {
        format: 'webp',
        quality: 80,
      };

      const result = await imageService.batchProcess(buffers, 'convert', params);

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.results).toHaveLength(3);
      expect(result.totalTime).toBeGreaterThan(0);
    });

    it('should handle batch resize', async () => {
      const buffers = [testImageBuffer, testImageBuffer];
      const params: ResizeImageRequest = {
        width: 50,
        height: 50,
        fit: 'cover',
      };

      const result = await imageService.batchProcess(buffers, 'resize', params);

      expect(result.successCount).toBe(2);
      result.results.forEach((r) => {
        expect(r.metadata.width).toBe(50);
        expect(r.metadata.height).toBe(50);
      });
    });

    it('should handle errors in batch processing', async () => {
      const invalidBuffer = Buffer.from('invalid');
      const buffers = [testImageBuffer, invalidBuffer, testImageBuffer];
      const params: OptimizeImageRequest = {
        quality: 80,
      };

      const result = await imageService.batchProcess(buffers, 'optimize', params);

      expect(result.successCount).toBeLessThan(3);
      expect(result.failureCount).toBeGreaterThan(0);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should process image within reasonable time', async () => {
      const startTime = Date.now();

      await imageService.convertImage(testImageBuffer, {
        format: 'webp',
        quality: 80,
      });

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle large dimension images', async () => {
      const largeImage = await sharp({
        create: {
          width: 5000,
          height: 5000,
          channels: 3,
          background: { r: 100, g: 100, b: 100 },
        },
      })
        .png()
        .toBuffer();

      const result = await imageService.resizeImage(largeImage, {
        width: 1000,
        height: 1000,
        fit: 'cover',
      });

      expect(result.metadata.width).toBe(1000);
      expect(result.metadata.height).toBe(1000);
    });
  });

  describe('Coverage Gaps', () => {
    it('should return early if optimization target met immediately', async () => {
      const largeTarget = testImageBuffer.length * 2;
      // @ts-ignore - Accessing private method for testing
      const result = await (imageService as any).optimizeToTargetSize(
        testImageBuffer,
        largeTarget,
        'jpeg',
        80
      );
      expect(result.data.length).toBeLessThanOrEqual(largeTarget);
    });

    it('should handle EXIF parsing errors gracefully', () => {
      const garbage = Buffer.from('garbage data');
      // @ts-ignore - Accessing private method for testing
      const result = (imageService as any).parseExifData(garbage);
      expect(result).toEqual({});
    });

    it('should handle IPTC parsing errors gracefully', () => {
      const garbage = Buffer.from('garbage data');
      // @ts-ignore - Accessing private method for testing
      const result = (imageService as any).parseIptcData(garbage);
      expect(result).toEqual({});
    });

    it('should add image watermark', async () => {
      const watermarkBuffer = await sharp({
        create: { width: 10, height: 10, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }
      })
        .png()
        .toBuffer();

      const result = await imageService.addWatermark(testImageBuffer, {
        type: 'image',
        imageBuffer: watermarkBuffer,
        position: 'center',
        opacity: 0.5
      });
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.size).toBeGreaterThan(0);
    });
  });
});

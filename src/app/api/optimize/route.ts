/**
 * Image Optimization API Route
 * POST /api/optimize
 * 
 * Optimizes images for web delivery with compression and format conversion
 */

import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/image.service';
import type { OptimizeImageRequest } from '@/types/image.types';
import {
  getMimeType,
  generateUniqueFilename,
  parseFilename,
  createErrorResponse,
} from '@/utils/image.utils';
import { logger } from '@/utils/logger';
import { validateImageFile, validateQuality } from '@/utils/validation';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        createErrorResponse('No file provided'),
        { status: 400 }
      );
    }

    // Validate file type and size
    try {
      validateImageFile(file);
    } catch (error) {
      return NextResponse.json(
        createErrorResponse(error instanceof Error ? error.message : 'Invalid file'),
        { status: 400 }
      );
    }

    // Parse options
    const quality = formData.get('quality');
    const progressive = formData.get('progressive') === 'true';
    const lossless = formData.get('lossless') === 'true';
    const maxFileSize = formData.get('maxFileSize');
    const format = formData.get('format') as string | null;
    const stripMetadata = formData.get('stripMetadata') === 'true';

    // Validate quality if provided
    if (quality) {
      try {
        validateQuality(parseInt(quality as string, 10));
      } catch (error) {
        return NextResponse.json(
          createErrorResponse(error instanceof Error ? error.message : 'Invalid quality'),
          { status: 400 }
        );
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info('Image optimization request received', {
      originalName: file.name,
      size: file.size,
      quality,
      format,
    });

    // Build optimization options
    const options: OptimizeImageRequest = {
      quality: quality ? parseInt(quality as string, 10) : undefined,
      progressive,
      lossless,
      maxFileSize: maxFileSize ? parseInt(maxFileSize as string, 10) : undefined,
      format: format as OptimizeImageRequest['format'],
      stripMetadata,
    };

    // Process image
    const result = await imageService.optimizeImage(buffer, options);

    // Generate filename
    const outputFormat = (format || result.format) as string;
    const filename = generateUniqueFilename(
      parseFilename(file.name), 
      outputFormat as any
    );

    const compressionRatio = ((1 - result.size / buffer.length) * 100).toFixed(2);

    logger.info('Image optimization completed', {
      processingTime: Date.now() - startTime,
      inputSize: buffer.length,
      outputSize: result.size,
      compressionRatio: `${compressionRatio}%`,
    });

    // Return processed image
    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': getMimeType(outputFormat as any),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Processing-Time': `${result.processingTime}ms`,
        'X-Input-Size': `${buffer.length}`,
        'X-Output-Size': `${result.size}`,
        'X-Compression-Ratio': `${compressionRatio}%`,
        'X-Output-Format': result.format,
      },
    });
  } catch (error) {
    logger.error('Image optimization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      createErrorResponse(
        'Image optimization failed',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

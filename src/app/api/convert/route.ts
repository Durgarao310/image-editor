/**
 * Image Conversion API Route
 * POST /api/convert
 * 
 * Converts images between different formats with quality control
 */

import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/image.service';
import type { ConvertImageRequest } from '@/types/image.types';
import {
  getMimeType,
  generateUniqueFilename,
  parseFilename,
  createErrorResponse,
} from '@/utils/image.utils';
import { logger } from '@/utils/logger';

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

    // Parse options
    const format = formData.get('format') as string;
    const quality = formData.get('quality');
    const maintainAspectRatio = formData.get('maintainAspectRatio') === 'true';
    const stripMetadata = formData.get('stripMetadata') === 'true';

    if (!format) {
      return NextResponse.json(
        createErrorResponse('Output format is required'),
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info('Image conversion request received', {
      originalName: file.name,
      size: file.size,
      format,
      quality,
    });

    // Build conversion options
    const options: ConvertImageRequest = {
      format: format as ConvertImageRequest['format'],
      quality: quality ? parseInt(quality as string, 10) : undefined,
      maintainAspectRatio,
      stripMetadata,
    };

    // Process image
    const result = await imageService.convertImage(buffer, options);

    // Generate filename
    const filename = generateUniqueFilename(parseFilename(file.name), format as ConvertImageRequest['format']);

    logger.info('Image conversion completed', {
      processingTime: Date.now() - startTime,
      outputSize: result.size,
    });

    // Return processed image
    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': getMimeType(format as ConvertImageRequest['format']),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Processing-Time': `${result.processingTime}ms`,
        'X-Output-Size': `${result.size}`,
        'X-Output-Format': result.format,
      },
    });
  } catch (error) {
    logger.error('Image conversion failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      createErrorResponse(
        'Image conversion failed',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

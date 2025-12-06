/**
 * Image Resize API Route
 * POST /api/resize
 * 
 * Resizes and transforms images with various fit strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/image.service';
import type { ResizeImageRequest } from '@/types/image.types';
import {
  getMimeType,
  generateUniqueFilename,
  parseFilename,
  createErrorResponse,
  validateDimensions,
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
    const width = formData.get('width');
    const height = formData.get('height');
    const fit = formData.get('fit') as ResizeImageRequest['fit'];
    const position = formData.get('position') as ResizeImageRequest['position'];
    const rotate = formData.get('rotate');
    const flipHorizontal = formData.get('flipHorizontal') === 'true';
    const flipVertical = formData.get('flipVertical') === 'true';
    const format = formData.get('format') as string | null;
    const quality = formData.get('quality');
    const background = formData.get('background') as string | null;
    const optimizeForWeb = formData.get('optimizeForWeb') === 'true';

    // Validate dimensions
    const widthNum = width ? parseInt(width as string, 10) : undefined;
    const heightNum = height ? parseInt(height as string, 10) : undefined;

    if (widthNum || heightNum) {
      validateDimensions(widthNum, heightNum);
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info('Image resize request received', {
      originalName: file.name,
      size: file.size,
      width: widthNum,
      height: heightNum,
      fit,
    });

    // Build resize options
    const options: ResizeImageRequest = {
      width: widthNum,
      height: heightNum,
      fit: fit || 'cover',
      position: position || 'center',
      rotate: rotate ? parseInt(rotate as string, 10) : undefined,
      flipHorizontal,
      flipVertical,
      format: format as ResizeImageRequest['format'],
      quality: quality ? parseInt(quality as string, 10) : undefined,
      background: background || undefined,
      optimizeForWeb,
    };

    // Process image
    const result = await imageService.resizeImage(buffer, options);

    // Generate filename
    const outputFormat = (format || result.format) as string;
    const filename = generateUniqueFilename(
      parseFilename(file.name), 
      outputFormat as any
    );

    logger.info('Image resize completed', {
      processingTime: Date.now() - startTime,
      outputSize: result.size,
    });

    // Return processed image
    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': getMimeType(outputFormat as any),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Processing-Time': `${result.processingTime}ms`,
        'X-Output-Size': `${result.size}`,
        'X-Output-Format': result.format,
        'X-Output-Width': `${result.metadata.width}`,
        'X-Output-Height': `${result.metadata.height}`,
      },
    });
  } catch (error) {
    logger.error('Image resize failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      createErrorResponse(
        'Image resize failed',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

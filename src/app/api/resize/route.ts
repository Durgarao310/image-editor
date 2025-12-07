/**
 * Image Resize API Route
 * POST /api/resize
 * 
 * Resizes and transforms images with various fit strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/image.service';
import type { ResizeImageRequest, SupportedOutputFormat } from '@/types/image.types';
import {
  getMimeType,
  generateUniqueFilename,
  parseFilename,
  createErrorResponse,
} from '@/utils/image.utils';
import { logger } from '@/utils/logger';
import { validateImageFile, validateDimensions, validateQuality } from '@/utils/validation';

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        createErrorResponse('Image resize failed', errorMessage),
        { status: 400 }
      );
    }

    // Parse options
    const width = formData.get('width');
    const height = formData.get('height');
    const fit = (formData.get('fit') as ResizeImageRequest['fit']) || 'cover';
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

    if (!widthNum && !heightNum) {
      return NextResponse.json(
        createErrorResponse('At least width or height must be provided'),
        { status: 400 }
      );
    }

    // Validate dimensions and quality
    try {
      validateDimensions(widthNum, heightNum);
      if (quality) {
        validateQuality(parseInt(quality as string, 10));
      }
    } catch (error) {
      return NextResponse.json(
        createErrorResponse(error instanceof Error ? error.message : 'Invalid parameters'),
        { status: 400 }
      );
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
      fitType: typeof fit,
    });

    // Build resize options
    const options: ResizeImageRequest = {
      width: widthNum,
      height: heightNum,
      fit: fit,
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
    const filename = generateUniqueFilename(
      parseFilename(file.name),
      result.format as SupportedOutputFormat
    );

    logger.info('Image resize completed', {
      processingTime: Date.now() - startTime,
      outputSize: result.size,
    });

    // Return processed image
    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': getMimeType(result.format as SupportedOutputFormat),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Processing-Time': `${result.processingTime}ms`,
        'X-Output-Size': `${result.size}`,
        'X-Output-Format': result.format,
        'X-Output-Width': `${result.metadata.width}`,
        'X-Output-Height': `${result.metadata.height}`,
      },
    });
  } catch (error: unknown) {
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

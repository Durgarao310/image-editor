/**
 * Thumbnail Generation API Route
 * POST /api/thumbnail
 * 
 * Generates thumbnails with preset configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/image.service';
import { THUMBNAIL_PRESETS } from '@/types/image.types';
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
    const preset = formData.get('preset') as string;
    
    if (!file) {
      return NextResponse.json(
        createErrorResponse('No file provided'),
        { status: 400 }
      );
    }

    if (!preset || !THUMBNAIL_PRESETS[preset as keyof typeof THUMBNAIL_PRESETS]) {
      return NextResponse.json(
        createErrorResponse(`Invalid preset. Available presets: ${Object.keys(THUMBNAIL_PRESETS).join(', ')}`),
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info('Thumbnail generation request received', {
      originalName: file.name,
      size: file.size,
      preset,
    });

    // Generate thumbnail
    const result = await imageService.generateThumbnail(
      buffer,
      preset as keyof typeof THUMBNAIL_PRESETS
    );

    // Generate filename
    const filename = generateUniqueFilename(
      `${parseFilename(file.name)}_${preset}`,
      result.format as any
    );

    logger.info('Thumbnail generation completed', {
      processingTime: Date.now() - startTime,
      outputSize: result.size,
    });

    // Return thumbnail
    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': getMimeType(result.format as any),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Processing-Time': `${result.processingTime}ms`,
        'X-Output-Size': `${result.size}`,
        'X-Preset': preset,
      },
    });
  } catch (error) {
    logger.error('Thumbnail generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      createErrorResponse(
        'Thumbnail generation failed',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

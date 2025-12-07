/**
 * Image Metadata API Route
 * POST /api/metadata
 * 
 * Extracts and updates image metadata (EXIF, IPTC, XMP)
 */

import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/image.service';
import type { UpdateMetadataRequest, ExtractMetadataRequest, SupportedOutputFormat } from '@/types/image.types';
import {
  getMimeType,
  generateUniqueFilename,
  parseFilename,
  createErrorResponse,
  createSuccessResponse,
} from '@/utils/image.utils';
import { logger } from '@/utils/logger';
import { validateImageFile } from '@/utils/validation';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const operation = formData.get('operation') as string; // 'extract' or 'update'

    if (!file) {
      return NextResponse.json(
        createErrorResponse('No file provided'),
        { status: 400 }
      );
    }

    // Validate file type and size
    try {
      validateImageFile(file);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        createErrorResponse('Metadata extraction failed', errorMessage),
        { status: 400 }
      );
    }

    if (!operation || !['extract', 'update'].includes(operation)) {
      return NextResponse.json(
        createErrorResponse('Operation must be either "extract" or "update"'),
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info('Metadata operation request received', {
      originalName: file.name,
      operation,
    });

    if (operation === 'extract') {
      // Extract metadata
      const includeExif = formData.get('includeExif') !== 'false';
      const includeIptc = formData.get('includeIptc') === 'true';
      const includeXmp = formData.get('includeXmp') === 'true';
      const includeIcc = formData.get('includeIcc') === 'true';

      const options: ExtractMetadataRequest = {
        includeExif,
        includeIptc,
        includeXmp,
        includeIcc,
      };

      const metadata = await imageService.extractMetadata(buffer, options);

      logger.info('Metadata extraction completed', {
        processingTime: Date.now() - startTime,
      });

      return NextResponse.json(createSuccessResponse(metadata));
    } else {
      // Update metadata
      const title = formData.get('title') as string | null;
      const description = formData.get('description') as string | null;
      const author = formData.get('author') as string | null;
      const copyright = formData.get('copyright') as string | null;
      const stripExisting = formData.get('stripExisting') === 'true';

      const customFields: Record<string, string> = {};
      formData.forEach((value, key) => {
        if (key.startsWith('custom_')) {
          customFields[key.replace('custom_', '')] = value as string;
        }
      });

      const options: UpdateMetadataRequest = {
        title: title || undefined,
        description: description || undefined,
        author: author || undefined,
        copyright: copyright || undefined,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
        stripExisting,
      };

      const result = await imageService.updateMetadata(buffer, options);

      // Generate filename
      const filename = generateUniqueFilename(
        parseFilename(file.name),
        result.format as SupportedOutputFormat
      );

      logger.info('Metadata update completed', {
        processingTime: Date.now() - startTime,
      });

      // Return processed image
      // Return processed image
      return new NextResponse(new Uint8Array(result.buffer), {
        headers: {
          'Content-Type': getMimeType(result.format as SupportedOutputFormat),
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Processing-Time': `${result.processingTime}ms`,
        },
      });
    }
  } catch (error: unknown) {
    logger.error('Metadata operation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      createErrorResponse(
        'Metadata operation failed',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

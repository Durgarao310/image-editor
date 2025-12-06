/**
 * Batch Processing API Route
 * POST /api/batch
 * 
 * Process multiple images in a single request
 */

import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/lib/image.service';
import type { ConvertImageRequest, ResizeImageRequest, OptimizeImageRequest } from '@/types/image.types';
import { createErrorResponse, createSuccessResponse } from '@/utils/image.utils';
import { logger } from '@/utils/logger';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for batch processing

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const files: File[] = [];
    
    // Collect all files
    formData.forEach((value, key) => {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value);
      }
    });

    if (files.length === 0) {
      return NextResponse.json(
        createErrorResponse('No files provided'),
        { status: 400 }
      );
    }

    const operation = formData.get('operation') as string;
    if (!operation || !['convert', 'resize', 'optimize'].includes(operation)) {
      return NextResponse.json(
        createErrorResponse('Operation must be "convert", "resize", or "optimize"'),
        { status: 400 }
      );
    }

    // Parse operation parameters
    const params = formData.get('params');
    if (!params) {
      return NextResponse.json(
        createErrorResponse('Operation parameters are required'),
        { status: 400 }
      );
    }

    const parsedParams = JSON.parse(params as string);

    logger.info('Batch processing request received', {
      fileCount: files.length,
      operation,
    });

    // Convert files to buffers
    const buffers = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );

    // Process batch
    const result = await imageService.batchProcess(
      buffers,
      operation as 'convert' | 'resize' | 'optimize',
      parsedParams as ConvertImageRequest | ResizeImageRequest | OptimizeImageRequest
    );

    logger.info('Batch processing completed', {
      totalTime: Date.now() - startTime,
      successCount: result.successCount,
      failureCount: result.failureCount,
    });

    // Return results summary (buffers would be too large for JSON)
    return NextResponse.json(
      createSuccessResponse({
        totalImages: files.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalProcessingTime: result.totalTime,
        errors: result.errors,
        results: result.results.map((r) => ({
          format: r.format,
          size: r.size,
          width: r.metadata.width,
          height: r.metadata.height,
          processingTime: r.processingTime,
        })),
      })
    );
  } catch (error) {
    logger.error('Batch processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      createErrorResponse(
        'Batch processing failed',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

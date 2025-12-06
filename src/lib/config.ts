/**
 * Application Configuration
 * Environment-driven configuration for image processing service
 */

export const config = {
  /**
   * Server configuration
   */
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  /**
   * Image processing limits and defaults
   */
  image: {
    /** Maximum file size in bytes (50 MB) */
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10),
    
    /** Allowed input formats */
    allowedFormats: (process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,webp,avif,bmp,tiff,gif,svg')
      .split(',')
      .map((f) => f.trim()),
    
    /** Default quality for compression */
    defaultQuality: parseInt(process.env.DEFAULT_QUALITY || '80', 10),
    
    /** Maximum dimension (width or height) */
    maxDimension: parseInt(process.env.MAX_DIMENSION || '10000', 10),
    
    /** Stream threshold - use streaming for files larger than this (10 MB) */
    streamThreshold: parseInt(process.env.STREAM_THRESHOLD || '10485760', 10),
  },

  /**
   * Logging configuration
   */
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development',
  },

  /**
   * Cloud storage configuration (optional)
   */
  storage: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET,
    },
    gcs: {
      projectId: process.env.GCS_PROJECT_ID,
      bucket: process.env.GCS_BUCKET,
    },
    azure: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      container: process.env.AZURE_CONTAINER,
    },
  },
} as const;

/**
 * Validate required environment variables
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (config.image.maxFileSize <= 0) {
    errors.push('MAX_FILE_SIZE must be a positive number');
  }

  if (config.image.defaultQuality < 1 || config.image.defaultQuality > 100) {
    errors.push('DEFAULT_QUALITY must be between 1 and 100');
  }

  if (config.image.maxDimension <= 0) {
    errors.push('MAX_DIMENSION must be a positive number');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

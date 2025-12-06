/**
 * Image Processing Service Type Definitions
 * FAANG-grade type safety for all image operations
 */

/**
 * Supported image formats for input
 */
export type SupportedInputFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'bmp' | 'tiff' | 'gif' | 'svg';

/**
 * Supported image formats for output
 */
export type SupportedOutputFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'pdf' | 'svg';

/**
 * Image fit strategies for resizing
 */
export type FitStrategy = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

/**
 * Image position for cropping
 */
export type CropPosition = 'center' | 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top' | 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'entropy' | 'attention';

/**
 * Request interface for image format conversion
 */
export interface ConvertImageRequest {
  /** Target output format */
  format: SupportedOutputFormat;
  /** Quality (1-100, default: 80) */
  quality?: number;
  /** Maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** Remove metadata for privacy */
  stripMetadata?: boolean;
}

/**
 * Request interface for image resizing
 */
export interface ResizeImageRequest {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Fit strategy (default: 'cover') */
  fit?: FitStrategy;
  /** Position for cropping (default: 'center') */
  position?: CropPosition;
  /** Rotation angle in degrees */
  rotate?: number;
  /** Flip horizontally */
  flipHorizontal?: boolean;
  /** Flip vertically */
  flipVertical?: boolean;
  /** Output format */
  format?: SupportedOutputFormat;
  /** Quality (1-100) */
  quality?: number;
  /** Background color for transparent areas (hex or rgba) */
  background?: string;
  /** Enable web optimization */
  optimizeForWeb?: boolean;
}

/**
 * Image metadata structure
 */
export interface ImageMetadata {
  /** Image format */
  format: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Color space */
  space: string;
  /** Number of channels */
  channels: number;
  /** Bit depth */
  depth: string;
  /** Pixel density */
  density?: number;
  /** Has alpha channel */
  hasAlpha: boolean;
  /** File size in bytes */
  size?: number;
  /** EXIF data */
  exif?: ExifMetadata;
  /** IPTC data */
  iptc?: Record<string, string>;
  /** XMP data */
  xmp?: string;
  /** ICC profile name */
  icc?: string;
}

/**
 * EXIF metadata structure
 */
export interface ExifMetadata {
  /** Image title/description */
  ImageDescription?: string;
  /** Camera make */
  Make?: string;
  /** Camera model */
  Model?: string;
  /** Orientation */
  Orientation?: number;
  /** X Resolution */
  XResolution?: number;
  /** Y Resolution */
  YResolution?: number;
  /** Software used */
  Software?: string;
  /** Date/time */
  DateTime?: string;
  /** Artist/author */
  Artist?: string;
  /** Copyright */
  Copyright?: string;
  /** Exposure time */
  ExposureTime?: number;
  /** F-number */
  FNumber?: number;
  /** ISO speed */
  ISOSpeedRatings?: number;
  /** Focal length */
  FocalLength?: number;
  /** GPS latitude */
  GPSLatitude?: number[];
  /** GPS longitude */
  GPSLongitude?: number[];
  /** Additional fields */
  [key: string]: string | number | number[] | undefined;
}

/**
 * Request to update image metadata
 */
export interface UpdateMetadataRequest {
  /** Image title */
  title?: string;
  /** Image description */
  description?: string;
  /** Author/artist */
  author?: string;
  /** Copyright information */
  copyright?: string;
  /** Custom metadata fields */
  customFields?: Record<string, string>;
  /** Strip all existing metadata */
  stripExisting?: boolean;
}

/**
 * Request to extract metadata
 */
export interface ExtractMetadataRequest {
  /** Include EXIF data */
  includeExif?: boolean;
  /** Include IPTC data */
  includeIptc?: boolean;
  /** Include XMP data */
  includeXmp?: boolean;
  /** Include ICC profile */
  includeIcc?: boolean;
}

/**
 * Image optimization request
 */
export interface OptimizeImageRequest {
  /** Target quality (1-100) */
  quality?: number;
  /** Enable progressive rendering (JPEG) */
  progressive?: boolean;
  /** Enable lossless compression */
  lossless?: boolean;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Output format (default: keep original) */
  format?: SupportedOutputFormat;
  /** Strip metadata */
  stripMetadata?: boolean;
}

/**
 * Batch processing request
 */
export interface BatchProcessRequest {
  /** Operation type */
  operation: 'convert' | 'resize' | 'optimize';
  /** Operation-specific parameters */
  params: ConvertImageRequest | ResizeImageRequest | OptimizeImageRequest;
}

/**
 * Watermark configuration
 */
export interface WatermarkConfig {
  /** Watermark type */
  type: 'text' | 'image';
  /** Text content (for text watermarks) */
  text?: string;
  /** Image buffer (for image watermarks) */
  imageBuffer?: Buffer;
  /** Position */
  position?: CropPosition;
  /** Opacity (0-1) */
  opacity?: number;
  /** Font size (for text) */
  fontSize?: number;
  /** Font color (for text) */
  fontColor?: string;
  /** Offset X */
  offsetX?: number;
  /** Offset Y */
  offsetY?: number;
}

/**
 * Thumbnail preset configuration
 */
export interface ThumbnailPreset {
  /** Preset name */
  name: string;
  /** Width */
  width: number;
  /** Height */
  height: number;
  /** Fit strategy */
  fit: FitStrategy;
  /** Quality */
  quality: number;
  /** Format */
  format: SupportedOutputFormat;
}

/**
 * Standard thumbnail presets
 */
export const THUMBNAIL_PRESETS: Record<string, ThumbnailPreset> = {
  small: {
    name: 'small',
    width: 256,
    height: 256,
    fit: 'cover',
    quality: 80,
    format: 'webp',
  },
  medium: {
    name: 'medium',
    width: 512,
    height: 512,
    fit: 'cover',
    quality: 80,
    format: 'webp',
  },
  large: {
    name: 'large',
    width: 1024,
    height: 1024,
    fit: 'cover',
    quality: 85,
    format: 'webp',
  },
};

/**
 * Service response wrapper
 */
export interface ServiceResponse<T> {
  /** Success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message */
  error?: string;
  /** Error details */
  details?: unknown;
}

/**
 * Image processing result
 */
export interface ImageProcessingResult {
  /** Processed image buffer */
  buffer: Buffer;
  /** Output format */
  format: string;
  /** Output metadata */
  metadata: ImageMetadata;
  /** File size in bytes */
  size: number;
  /** Processing time in ms */
  processingTime: number;
}

/**
 * Batch processing result
 */
export interface BatchProcessingResult {
  /** Individual results */
  results: ImageProcessingResult[];
  /** Total processing time */
  totalTime: number;
  /** Success count */
  successCount: number;
  /** Failure count */
  failureCount: number;
  /** Error details */
  errors?: Array<{ index: number; error: string }>;
}

/**
 * Cloud storage configuration
 */
export interface CloudStorageConfig {
  /** Provider type */
  provider: 's3' | 'gcs' | 'azure';
  /** Bucket/container name */
  bucket: string;
  /** Region (for S3) */
  region?: string;
  /** Credentials */
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    projectId?: string;
    connectionString?: string;
  };
}

/**
 * Upload result for cloud storage
 */
export interface CloudUploadResult {
  /** Upload success */
  success: boolean;
  /** File URL */
  url?: string;
  /** File key/path */
  key?: string;
  /** Error message */
  error?: string;
}

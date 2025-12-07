"use client";

/**
 * Image Preview Panel Component
 * Three-panel view: Original, Comparison, and Live Preview
 */

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { Eye, EyeOff, Image as ImageIcon, Ruler, Weight } from "lucide-react";

interface ImagePreviewPanelProps {
  originalFile: File;
  previewUrl: string | null;
  showComparison?: boolean;
}

interface ImageDimensions {
  width: number;
  height: number;
  size: number;
  format: string;
}

export default function ImagePreviewPanel({
  originalFile,
  previewUrl,
  showComparison = true,
}: ImagePreviewPanelProps) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [originalDimensions, setOriginalDimensions] =
    useState<ImageDimensions | null>(null);
  const [previewDimensions, setPreviewDimensions] =
    useState<ImageDimensions | null>(null);
  const [previewSize, setPreviewSize] = useState<number | null>(null);

  // Create URL for original file and get dimensions
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setOriginalUrl(url);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({
          width: img.width,
          height: img.height,
          size: originalFile.size,
          format: originalFile.type.split("/")[1].toUpperCase(),
        });
      };
      img.src = url;
    };
    reader.readAsDataURL(originalFile);

    return () => {
      // Clean up the URL when component unmounts or originalFile changes
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
    };
  }, [originalFile, originalUrl]);

  // Get preview image dimensions and size
  useEffect(() => {
    if (!previewUrl) {
      setPreviewDimensions(null);
      setPreviewSize(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setPreviewDimensions({
        width: img.width,
        height: img.height,
        size: 0, // Will be fetched from blob
        format: "WEBP", // Default, will be updated if possible
      });
    };
    img.src = previewUrl;

    // Fetch blob to get actual file size
    fetch(previewUrl)
      .then((res) => res.blob())
      .then((blob) => {
        setPreviewSize(blob.size);
      })
      .catch(() => {
        setPreviewSize(null);
      });
  }, [previewUrl]);

  if (!originalUrl || !originalDimensions) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCompressionRatio = (): { ratio: string; saved: boolean } => {
    if (!previewSize || !originalDimensions)
      return { ratio: "—", saved: false };
    const ratio = (1 - previewSize / originalDimensions.size) * 100;
    if (ratio > 0) {
      return { ratio: `${ratio.toFixed(1)}%`, saved: true };
    } else {
      const increase = Math.abs(ratio);
      return { ratio: `${increase.toFixed(1)}%`, saved: false };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Image Preview</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showPreview ? (
            <>
              <Eye size={16} />
              Hide Preview
            </>
          ) : (
            <>
              <EyeOff size={16} />
              Show Preview
            </>
          )}
        </button>
      </div>

      {showPreview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Original Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Original</h3>
            </div>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
              <NextImage
                fill
                src={originalUrl}
                alt="Original"
                className="object-contain"
              />
            </div>
            {/* Original Image Info */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Ruler size={14} />
                  Dimensions
                </span>
                <span className="font-medium text-gray-900">
                  {originalDimensions.width} × {originalDimensions.height}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Weight size={14} />
                  File Size
                </span>
                <span className="font-medium text-gray-900">
                  {formatFileSize(originalDimensions.size)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <ImageIcon size={14} />
                  Format
                </span>
                <span className="font-medium text-gray-900">
                  {originalDimensions.format}
                </span>
              </div>
            </div>
          </div>

          {/* Comparison Slider */}
          {showComparison && previewUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Compare</h3>
                <span className="text-xs text-gray-500">Side by Side</span>
              </div>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                <div className="grid grid-cols-2 h-full">
                  <div className="relative border-r-2 border-blue-300">
                    <NextImage
                      src={originalUrl}
                      alt="Original Half"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      Before
                    </div>
                  </div>
                  <div className="relative">
                    <NextImage
                      src={previewUrl}
                      alt="Preview Half"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      After
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                {previewUrl ? "Live Preview" : "Processing..."}
              </h3>
              {previewUrl && (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Updated
                </span>
              )}
            </div>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
              {previewUrl ? (
                <NextImage
                  fill
                  src={previewUrl}
                  alt="Preview"
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500">
                      Apply changes to see preview
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Preview Image Info */}
            {previewUrl && previewDimensions && (
              <div className="bg-green-50 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Ruler size={14} />
                    Dimensions
                  </span>
                  <span className="font-medium text-gray-900">
                    {previewDimensions.width} × {previewDimensions.height}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Weight size={14} />
                    File Size
                  </span>
                  <span className="font-medium text-gray-900">
                    {previewSize
                      ? formatFileSize(previewSize)
                      : "Calculating..."}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <ImageIcon size={14} />
                    Format
                  </span>
                  <span className="font-medium text-gray-900">
                    {previewDimensions.format}
                  </span>
                </div>
                {previewSize &&
                  (() => {
                    const compression = getCompressionRatio();
                    return (
                      <div
                        className={`flex items-center justify-between pt-2 border-t ${
                          compression.saved
                            ? "border-green-200"
                            : "border-orange-200"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            compression.saved
                              ? "text-green-700"
                              : "text-orange-700"
                          }`}
                        >
                          {compression.saved ? "Compressed" : "Size Change"}
                        </span>
                        <span
                          className={`font-bold ${
                            compression.saved
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {compression.ratio}{" "}
                          {compression.saved ? "saved" : "larger"}
                        </span>
                      </div>
                    );
                  })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

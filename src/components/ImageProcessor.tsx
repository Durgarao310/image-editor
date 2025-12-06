"use client";

/**
 * Image Processor Component
 * Main UI for image processing operations
 * Refactored with component splitting and custom hooks
 */

import ImageUpload from "./ImageUpload";
import OperationSelector from "./OperationSelector";
import ConvertOptions from "./options/ConvertOptions";
import ResizeOptions from "./options/ResizeOptions";
import OptimizeOptions from "./options/OptimizeOptions";
import ThumbnailOptions from "./options/ThumbnailOptions";
import ErrorDisplay from "./ErrorDisplay";
import ImagePreviewPanel from "./ImagePreviewPanel";
import { useImageProcessor } from "@/hooks/useImageProcessor";

export default function ImageProcessor() {
  const {
    file,
    operation,
    processing,
    error,
    options,
    livePreview,
    autoPreview,
    setOperation,
    handleFileSelect,
    updateOption,
    handleProcess,
    toggleAutoPreview,
  } = useImageProcessor();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Image Processing Service
        </h1>
        <p className="text-gray-600">
          Convert, resize, optimize, and transform your images
        </p>
      </div>

      {/* Real-time Preview Panel - Shows at top when file is selected */}
      {file && operation !== "metadata" && (
        <ImagePreviewPanel
          originalFile={file}
          previewUrl={livePreview}
          showComparison={true}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ImageUpload onFileSelect={handleFileSelect} />
        </div>

        {file && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <OperationSelector value={operation} onChange={setOperation} />
            {operation !== "metadata" && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="auto-preview"
                  checked={autoPreview}
                  onChange={toggleAutoPreview}
                  className="rounded"
                />
                <label
                  htmlFor="auto-preview"
                  className="text-sm text-blue-900 cursor-pointer"
                >
                  <span className="font-medium">Auto Preview:</span> Changes
                  will update preview automatically
                </label>
              </div>
            )}{" "}
            {operation === "convert" && (
              <ConvertOptions
                format={options.format}
                quality={options.quality}
                stripMetadata={options.stripMetadata}
                onFormatChange={(val) => updateOption("format", val)}
                onQualityChange={(val) => updateOption("quality", val)}
                onStripMetadataChange={(val) =>
                  updateOption("stripMetadata", val)
                }
              />
            )}
            {operation === "resize" && (
              <ResizeOptions
                width={options.width}
                height={options.height}
                fit={options.fit}
                onWidthChange={(val) => updateOption("width", val)}
                onHeightChange={(val) => updateOption("height", val)}
                onFitChange={(val) => updateOption("fit", val)}
              />
            )}
            {operation === "optimize" && (
              <OptimizeOptions
                quality={options.quality}
                onQualityChange={(val) => updateOption("quality", val)}
              />
            )}
            {operation === "thumbnail" && (
              <ThumbnailOptions
                preset={options.preset}
                onPresetChange={(val) => updateOption("preset", val)}
              />
            )}
            {operation === "metadata" && (
              <p className="text-sm text-gray-600">
                Extracts EXIF, IPTC, and other metadata from the image.
              </p>
            )}
            <button
              onClick={handleProcess}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? "Downloading..." : "Download Image"}
            </button>
            {error && <ErrorDisplay error={error} />}
          </div>
        )}
      </div>
    </div>
  );
}

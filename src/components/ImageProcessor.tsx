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
    customFilename,
    setOperation,
    handleFileSelect,
    updateOption,
    handleProcess,
    toggleAutoPreview,
    setCustomFilename,
  } = useImageProcessor();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Image Processing Service
          </h1>
        </div>
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
        <div className="h-full">
          <ImageUpload onFileSelect={handleFileSelect} />
        </div>

        <div className="h-full">
          {file ? (
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
              {/* Custom Filename Input */}
              {operation !== "metadata" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Filename (Optional)
                  </label>
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder="Leave empty for auto-generated name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    💡 File extension will be added automatically based on
                    format
                  </p>
                </div>
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
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Process Your Images
                </h3>
                <p className="text-gray-600 max-w-sm">
                  Upload an image to start converting, resizing, or optimizing.
                  Supports JPG, PNG, WebP, and more.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-md text-sm">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">Fast processing</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">Multiple formats</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">Live preview</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">Up to 50MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

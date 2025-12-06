"use client";

/**
 * Image Processor Component
 * Main UI for image processing operations
 */

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Operation = "convert" | "resize" | "optimize" | "metadata" | "thumbnail";

export default function ImageProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<Operation>("convert");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert options
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(80);
  const [stripMetadata, setStripMetadata] = useState(false);

  // Resize options
  const [width, setWidth] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [fit, setFit] = useState("cover");

  // Thumbnail preset
  const [preset, setPreset] = useState("medium");

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);

    // Load image to get dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      let endpoint = "";

      switch (operation) {
        case "convert":
          endpoint = "/api/convert";
          formData.append("format", format);
          formData.append("quality", quality.toString());
          formData.append("stripMetadata", stripMetadata.toString());
          break;

        case "resize":
          endpoint = "/api/resize";
          if (width) formData.append("width", width.toString());
          if (height) formData.append("height", height.toString());
          formData.append("fit", fit);
          formData.append("quality", quality.toString());
          formData.append("optimizeForWeb", "true");
          break;

        case "optimize":
          endpoint = "/api/optimize";
          formData.append("quality", quality.toString());
          formData.append("stripMetadata", stripMetadata.toString());
          formData.append("progressive", "true");
          break;

        case "thumbnail":
          endpoint = "/api/thumbnail";
          formData.append("preset", preset);
          break;

        case "metadata":
          endpoint = "/api/metadata";
          formData.append("operation", "extract");
          formData.append("includeExif", "true");
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Processing failed");
      }

      if (operation === "metadata") {
        const metadata = await response.json();
        alert(JSON.stringify(metadata.data, null, 2));
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const filename =
          response.headers
            .get("content-disposition")
            ?.split("filename=")[1]
            ?.replace(/"/g, "") || "processed-image";

        setResult({ url, filename });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ImageUpload onFileSelect={handleFileSelect} />
        </div>

        {file && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation
              </label>
              <Select
                value={operation}
                onValueChange={(value) => setOperation(value as Operation)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="convert">Convert Format</SelectItem>
                  <SelectItem value="resize">Resize & Transform</SelectItem>
                  <SelectItem value="optimize">Optimize for Web</SelectItem>
                  <SelectItem value="thumbnail">Generate Thumbnail</SelectItem>
                  <SelectItem value="metadata">Extract Metadata</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operation === "convert" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="avif">AVIF</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === "convert" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {quality}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="strip-metadata"
                    checked={stripMetadata}
                    onChange={(e) => setStripMetadata(e.target.checked)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="strip-metadata"
                    className="text-sm text-gray-700"
                  >
                    Remove metadata (privacy mode)
                  </label>
                </div>
              </div>
            )}

            {operation === "resize" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={width || ""}
                      onChange={(e) =>
                        setWidth(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Auto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={height || ""}
                      onChange={(e) =>
                        setHeight(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Auto"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fit Strategy
                  </label>
                  <Select value={fit} onValueChange={setFit}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select fit strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover (crop to fit)</SelectItem>
                      <SelectItem value="contain">
                        Contain (fit inside)
                      </SelectItem>
                      <SelectItem value="fill">Fill (stretch)</SelectItem>
                      <SelectItem value="inside">Inside</SelectItem>
                      <SelectItem value="outside">Outside</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {operation === "optimize" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {quality}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Optimizes image size while maintaining visual quality. Ideal
                  for web delivery.
                </p>
              </div>
            )}

            {operation === "thumbnail" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Size
                </label>
                <Select value={preset} onValueChange={setPreset}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (256x256)</SelectItem>
                    <SelectItem value="medium">Medium (512x512)</SelectItem>
                    <SelectItem value="large">Large (1024x1024)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              {processing ? "Processing..." : "Process Image"}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
                <p className="text-sm text-green-600 font-semibold">
                  ✓ Processing complete!
                </p>
                <img
                  src={result.url}
                  alt="Processed"
                  className="max-h-96 mx-auto rounded-lg shadow-lg"
                />
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Download Result
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Result Preview
          </h2>
          <img
            src={result.url}
            alt="Processed"
            className="max-w-full mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * Custom Hook: useImageProcessor
 * Manages image processing state and logic
 */

import { useState, useCallback, useEffect } from "react";

type Operation = "convert" | "resize" | "optimize" | "metadata" | "thumbnail";

interface ProcessingOptions {
  format: string;
  quality: number;
  stripMetadata: boolean;
  width?: number;
  height?: number;
  fit: string;
  preset: string;
}

interface ProcessingResult {
  url: string;
  filename: string;
}

export function useImageProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<Operation>("convert");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Processing options
  const [options, setOptions] = useState<ProcessingOptions>({
    format: "webp",
    quality: 80,
    stripMetadata: false,
    width: undefined,
    height: undefined,
    fit: "cover",
    preset: "medium",
  });

  // Clean up object URLs when result changes or component unmounts
  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);

    // Load image to get dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOptions((prev) => ({
          ...prev,
          width: img.width,
          height: img.height,
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const updateOption = useCallback(<K extends keyof ProcessingOptions>(
    key: K,
    value: ProcessingOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const buildFormData = useCallback((): FormData | null => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    switch (operation) {
      case "convert":
        formData.append("format", options.format);
        formData.append("quality", options.quality.toString());
        formData.append("stripMetadata", options.stripMetadata.toString());
        break;

      case "resize":
        if (options.width) formData.append("width", options.width.toString());
        if (options.height) formData.append("height", options.height.toString());
        formData.append("fit", options.fit);
        formData.append("quality", options.quality.toString());
        formData.append("optimizeForWeb", "true");
        break;

      case "optimize":
        formData.append("quality", options.quality.toString());
        formData.append("stripMetadata", options.stripMetadata.toString());
        formData.append("progressive", "true");
        break;

      case "thumbnail":
        formData.append("preset", options.preset);
        break;

      case "metadata":
        formData.append("operation", "extract");
        formData.append("includeExif", "true");
        break;
    }

    return formData;
  }, [file, operation, options]);

  const getEndpoint = useCallback((): string => {
    const endpoints: Record<Operation, string> = {
      convert: "/api/convert",
      resize: "/api/resize",
      optimize: "/api/optimize",
      thumbnail: "/api/thumbnail",
      metadata: "/api/metadata",
    };
    return endpoints[operation];
  }, [operation]);

  const handleProcess = useCallback(async () => {
    const formData = buildFormData();
    if (!formData) return;

    setProcessing(true);
    setError(null);
    
    // Clean up previous result URL
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    setResult(null);

    try {
      const endpoint = getEndpoint();
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
  }, [buildFormData, getEndpoint, operation, result]);

  const handleDownload = useCallback(() => {
    if (!result) return;

    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [result]);

  const cleanupResult = useCallback(() => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
  }, [result]);

  return {
    file,
    operation,
    processing,
    result,
    error,
    options,
    setOperation,
    handleFileSelect,
    updateOption,
    handleProcess,
    handleDownload,
    cleanupResult,
  };
}

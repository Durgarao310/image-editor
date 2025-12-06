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


export function useImageProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<Operation>("convert");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [livePreview, setLivePreview] = useState<string | null>(null);
  const [autoPreview, setAutoPreview] = useState(true);
  const [customFilename, setCustomFilename] = useState<string>("");

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

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (livePreview) {
        URL.revokeObjectURL(livePreview);
      }
    };
  }, [livePreview]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setLivePreview(null);

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
        formData.append("format", options.format);
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
        const defaultFilename =
          response.headers
            .get("content-disposition")
            ?.split("filename=")[1]
            ?.replace(/"/g, "") || "processed-image";

        // Use custom filename if provided, otherwise use default
        const finalFilename = customFilename.trim() || defaultFilename;

        // Trigger download immediately
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up blob URL
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  }, [buildFormData, getEndpoint, operation]);

  const toggleAutoPreview = useCallback(() => {
    setAutoPreview((prev) => !prev);
  }, []);

  const generateLivePreview = useCallback(async () => {
    if (!file || operation === "metadata") return;

    const formData = buildFormData();
    if (!formData) return;

    try {
      const endpoint = getEndpoint();
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        
        // Clean up old preview
        setLivePreview((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return URL.createObjectURL(blob);
        });
      }
    } catch (err) {
      // Silent fail for preview - don't show error to user
      console.debug("Preview generation failed:", err);
    }
  }, [file, operation, buildFormData, getEndpoint]);

  // Auto-generate live preview when options change
  useEffect(() => {
    if (!file || !autoPreview || operation === "metadata") return;

    const debounceTimer = setTimeout(() => {
      generateLivePreview();
    }, 500); // Debounce to avoid too many requests

    return () => clearTimeout(debounceTimer);
  }, [file, options, operation, autoPreview, generateLivePreview]);

  return {
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
    generateLivePreview,
    setCustomFilename,
  };
}

"use client";

/**
 * Convert Options Component
 * Configuration UI for image format conversion
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConvertOptionsProps {
  format: string;
  quality: number;
  stripMetadata: boolean;
  onFormatChange: (format: string) => void;
  onQualityChange: (quality: number) => void;
  onStripMetadataChange: (stripMetadata: boolean) => void;
}

export default function ConvertOptions({
  format,
  quality,
  stripMetadata,
  onFormatChange,
  onQualityChange,
  onStripMetadataChange,
}: ConvertOptionsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Format
        </label>
        <Select value={format} onValueChange={onFormatChange}>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality: {quality}
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => onQualityChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="strip-metadata"
          checked={stripMetadata}
          onChange={(e) => onStripMetadataChange(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="strip-metadata" className="text-sm text-gray-700">
          Remove metadata (privacy mode)
        </label>
      </div>
    </div>
  );
}

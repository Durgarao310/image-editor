"use client";

/**
 * Thumbnail Options Component
 * Configuration UI for thumbnail generation
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ThumbnailOptionsProps {
  preset: string;
  onPresetChange: (preset: string) => void;
}

export default function ThumbnailOptions({
  preset,
  onPresetChange,
}: ThumbnailOptionsProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Thumbnail Size
      </label>
      <Select value={preset} onValueChange={onPresetChange}>
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
  );
}

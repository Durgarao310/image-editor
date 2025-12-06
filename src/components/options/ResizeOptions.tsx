"use client";

/**
 * Resize Options Component
 * Configuration UI for image resizing and transformations
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResizeOptionsProps {
  width?: number;
  height?: number;
  fit: string;
  onWidthChange: (width: number | undefined) => void;
  onHeightChange: (height: number | undefined) => void;
  onFitChange: (fit: string) => void;
}

export default function ResizeOptions({
  width,
  height,
  fit,
  onWidthChange,
  onHeightChange,
  onFitChange,
}: ResizeOptionsProps) {
  return (
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
              onWidthChange(
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
              onHeightChange(
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
        <Select value={fit} onValueChange={onFitChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select fit strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover (crop to fit)</SelectItem>
            <SelectItem value="contain">Contain (fit inside)</SelectItem>
            <SelectItem value="fill">Fill (stretch)</SelectItem>
            <SelectItem value="inside">Inside</SelectItem>
            <SelectItem value="outside">Outside</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

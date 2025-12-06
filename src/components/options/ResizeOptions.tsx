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
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">💡 Tip:</span> For fit strategies to
          work properly, provide <strong>both width and height</strong>.
          Providing only one dimension will maintain aspect ratio automatically.
        </p>
      </div>
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
          <SelectTrigger className="w-full text-left">
            <SelectValue placeholder="Select fit strategy" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="cover">
              <div className="flex flex-col items-start">
                <span className="font-medium">Cover</span>
                <span className="text-xs text-gray-500">
                  Crop to fill exact dimensions
                </span>
              </div>
            </SelectItem>
            <SelectItem value="contain">
              <div className="flex flex-col items-start">
                <span className="font-medium">Contain</span>
                <span className="text-xs text-gray-500">
                  Fit within dimensions, preserve aspect ratio
                </span>
              </div>
            </SelectItem>
            <SelectItem value="fill">
              <div className="flex flex-col items-start">
                <span className="font-medium">Fill</span>
                <span className="text-xs text-gray-500">
                  Ignore aspect ratio, stretch to exact size
                </span>
              </div>
            </SelectItem>
            <SelectItem value="inside">
              <div className="flex flex-col items-start">
                <span className="font-medium">Inside</span>
                <span className="text-xs text-gray-500">
                  Image fits within dimensions (never exceeds)
                </span>
              </div>
            </SelectItem>
            <SelectItem value="outside">
              <div className="flex flex-col items-start">
                <span className="font-medium">Outside</span>
                <span className="text-xs text-gray-500">
                  Image covers dimensions (may exceed both)
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-xs text-gray-500">
          {fit === "cover" &&
            "⚡ Best for thumbnails - crops image to exact dimensions"}
          {fit === "contain" &&
            "📐 Best for logos - maintains full image visibility"}
          {fit === "fill" && "⚠️ Warning - may distort image by stretching"}
          {fit === "inside" &&
            "🔽 Image will never exceed dimensions (preserves aspect)"}
          {fit === "outside" &&
            "🔼 Image will cover at minimum both dimensions (preserves aspect)"}
        </p>
      </div>
    </div>
  );
}

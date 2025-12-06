"use client";

/**
 * Optimize Options Component
 * Configuration UI for image optimization
 */

interface OptimizeOptionsProps {
  quality: number;
  onQualityChange: (quality: number) => void;
}

export default function OptimizeOptions({
  quality,
  onQualityChange,
}: OptimizeOptionsProps) {
  return (
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
          onChange={(e) => onQualityChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <p className="text-sm text-gray-600">
        Optimizes image size while maintaining visual quality. Ideal for web
        delivery.
      </p>
    </div>
  );
}

"use client";

/**
 * Processing Result Component
 * Displays processed image with download option
 */

import { useEffect } from "react";

interface ProcessingResultProps {
  url: string;
  filename: string;
  onDownload: () => void;
  onCleanup?: () => void;
}

export default function ProcessingResult({
  url,
  filename,
  onDownload,
  onCleanup,
}: ProcessingResultProps) {
  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (onCleanup) {
        onCleanup();
      }
    };
  }, [onCleanup]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
        <p className="text-sm text-green-600 font-semibold">
          ✓ Processing complete!
        </p>
        <img
          src={url}
          alt="Processed"
          className="max-h-96 mx-auto rounded-lg shadow-lg"
        />
        <button
          onClick={onDownload}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Download Result
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Result Preview
        </h2>
        <img
          src={url}
          alt="Processed"
          className="max-w-full mx-auto rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}

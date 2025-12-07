"use client";

/**
 * Processing Result Component
 * Displays processed image with download option
 */

import { useEffect } from "react";
import Image from "next/image";

interface ProcessingResultProps {
  url: string;
  onDownload: () => void;
  onCleanup?: () => void;
}

export default function ProcessingResult({
  url,
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
        <Image
          src={url}
          alt="Processed"
          width={400}
          height={300}
          className="max-h-96 w-auto mx-auto rounded-lg shadow-lg"
          unoptimized
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
        <Image
          src={url}
          alt="Processed"
          width={800}
          height={600}
          className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
          unoptimized
        />
      </div>
    </div>
  );
}

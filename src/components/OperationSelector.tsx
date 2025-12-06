"use client";

/**
 * Operation Selector Component
 * Dropdown for selecting image processing operation
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Operation =
  | "convert"
  | "resize"
  | "optimize"
  | "metadata"
  | "thumbnail";

interface OperationSelectorProps {
  value: Operation;
  onChange: (operation: Operation) => void;
}

export default function OperationSelector({
  value,
  onChange,
}: OperationSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Operation
      </label>
      <Select value={value} onValueChange={(val) => onChange(val as Operation)}>
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
  );
}

import ImageProcessor from "@/components/ImageProcessor";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12">
        <ImageProcessor />
      </div>
    </ErrorBoundary>
  );
}

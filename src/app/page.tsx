import ImageProcessor from "@/components/ImageProcessor";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Fast Image Editor",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "Free online image editor to convert, resize, crop, and optimize images directly in your browser. Supports JPG, PNG, WebP, AVIF, and PDF.",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
              featureList: [
                "Image Conversion",
                "Image Resizing",
                "Image Optimization",
                "Metadata Extraction",
                "Watermarking",
              ],
            }),
          }}
        />
        <main>
          <ImageProcessor />
        </main>
      </div>
    </ErrorBoundary>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fast Image Editor | Convert, Resize & Optimize Images",
    template: "%s | Fast Image Editor",
  },
  description:
    "Free online image editor. Convert JPG, PNG, WebP. Resize, crop, and optimize images for web. Fast, secure, and runs entirely in your browser.",
  keywords: [
    "image editor",
    "image converter",
    "resize image",
    "compress image",
    "webp converter",
    "image optimization",
    "free online tools",
  ],
  authors: [{ name: "Fast Image Editor Team" }],
  creator: "Fast Image Editor Team",
  publisher: "Fast Image Editor Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fast-image-editor.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fast Image Editor | Convert, Resize & Optimize Images",
    description:
      "Professional grade image editing tools in your browser. Convert formats, resize dimensions, and optimize file size without uploading to a server.",
    url: "https://fast-image-editor.com",
    siteName: "Fast Image Editor",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Fast Image Editor - Convert, Resize & Optimize Images",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fast Image Editor | Convert, Resize & Optimize Images",
    description:
      "Fast, secure, and free online image tools. Edit images directly in your browser.",
    creator: "@fastimageeditor",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [{ rel: "icon", url: "/favicon.ico" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

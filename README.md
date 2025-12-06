# Image Processing Service - Next.js Edition

## 🚀 Production-Grade Image Processing Service

A comprehensive, scalable image processing service built with Next.js 16, TypeScript, and Sharp. This service provides enterprise-level image manipulation capabilities including format conversion, resizing, optimization, metadata handling, and more.

## ✨ Features

### Core Capabilities
- **Format Conversion**: Convert between JPG, PNG, WEBP, AVIF, BMP, TIFF, GIF, SVG, and PDF
- **Image Resizing**: Multiple fit strategies (cover, contain, fill, inside, outside)
- **Transformations**: Rotate, flip horizontal/vertical, smart cropping
- **Optimization**: Web-optimized output with configurable quality and compression
- **Metadata Management**: Extract and modify EXIF, IPTC, XMP data
- **Thumbnail Generation**: Pre-configured presets (256px, 512px, 1024px)
- **Watermarking**: Text and image overlay support
- **Batch Processing**: Process multiple images simultaneously

### Technical Highlights
- ⚡ Built with Next.js 16 App Router
- 🔒 Type-safe with TypeScript
- 🎨 Modern UI with Tailwind CSS
- 📦 Production-ready architecture
- 🧪 Comprehensive test coverage (Jest)
- 📝 Full JSDoc documentation
- 🔧 Environment-driven configuration
- 📊 Structured logging
- 🎯 RESTful API design

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm

## 🛠️ Installation

```bash
# Clone or navigate to project directory
cd image-editor

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
image-editor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── convert/      # Format conversion endpoint
│   │   │   ├── resize/       # Image resizing endpoint
│   │   │   ├── metadata/     # Metadata operations endpoint
│   │   │   ├── optimize/     # Optimization endpoint
│   │   │   ├── thumbnail/    # Thumbnail generation endpoint
│   │   │   └── batch/        # Batch processing endpoint
│   │   ├── page.tsx          # Main UI page
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── ImageUpload.tsx   # File upload component
│   │   └── ImageProcessor.tsx # Main processing UI
│   ├── lib/
│   │   ├── image.service.ts  # Core image processing service
│   │   └── config.ts         # Application configuration
│   ├── types/
│   │   └── image.types.ts    # TypeScript type definitions
│   └── utils/
│       ├── image.utils.ts    # Utility functions
│       └── logger.ts         # Structured logging
├── jest.config.js            # Jest configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## 🔌 API Endpoints

### POST /api/convert
Convert image format with quality control.

### POST /api/resize
Resize and transform images.

### POST /api/metadata
Extract or update image metadata (EXIF, IPTC, XMP).

### POST /api/optimize
Optimize images for web delivery.

### POST /api/thumbnail
Generate thumbnails with presets.

### POST /api/batch
Process multiple images in batch.

**📖 See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference**

## 💻 Usage Examples

### Using the UI
Simply drag and drop your image, select an operation, configure options, and process!

### Using the API
```bash
# Convert to WebP
curl -X POST http://localhost:3000/api/convert \
  -F "file=@image.jpg" \
  -F "format=webp" \
  -F "quality=85" \
  -o output.webp

# Resize image
curl -X POST http://localhost:3000/api/resize \
  -F "file=@image.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "fit=cover" \
  -o resized.jpg
```

### Using the ImageService Directly

```typescript
import { imageService } from '@/lib/image.service';

// Convert image
const result = await imageService.convertImage(buffer, {
  format: 'webp',
  quality: 85,
  stripMetadata: true,
});

// Resize image
const resized = await imageService.resizeImage(buffer, {
  width: 800,
  height: 600,
  fit: 'cover',
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MAX_FILE_SIZE=52428800        # 50 MB
DEFAULT_QUALITY=80
MAX_DIMENSION=10000
```

See `.env.example` for all available options.

## 🎨 UI Features

The built-in web interface provides:
- ✨ Drag-and-drop file upload
- 🖼️ Real-time image preview
- 🎛️ Interactive controls for all operations
- 📊 Processing feedback and results
- 💾 One-click download
- 🎨 Modern, responsive design

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance

- **Large file support**: Handles images up to 50 MB
- **Memory efficient**: Streaming for files > 10 MB
- **Fast processing**: Optimized Sharp configuration
- **Batch operations**: Parallel processing support

## 🔒 Security

- **Input validation**: File type and size checks
- **Filename sanitization**: Path traversal prevention
- **Buffer validation**: Magic number verification
- **Error sanitization**: No sensitive data in errors

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License

---

**Built with ❤️ using Next.js, TypeScript, and Sharp**

*Enterprise-ready • Type-safe • Production-tested • Fully documented*


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

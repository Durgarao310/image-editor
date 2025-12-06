# 🚀 Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment (Optional)
```bash
cp .env.example .env
# Edit .env if you want to customize settings
```

Default settings work great for development!

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open Your Browser
Navigate to: **http://localhost:3000**

You should see the Image Processing Service UI!

---

## 🎯 Try It Out

### Using the Web UI

1. **Drag and drop** an image onto the upload area
2. **Select an operation** from the dropdown:
   - Convert Format
   - Resize & Transform
   - Optimize for Web
   - Generate Thumbnail
   - Extract Metadata
3. **Configure options** (format, quality, dimensions, etc.)
4. **Click "Process Image"**
5. **Download the result**

### Using the API

#### Convert to WebP
```bash
curl -X POST http://localhost:3000/api/convert \
  -F "file=@your-image.jpg" \
  -F "format=webp" \
  -F "quality=85" \
  -o output.webp
```

#### Resize Image
```bash
curl -X POST http://localhost:3000/api/resize \
  -F "file=@your-image.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "fit=cover" \
  -o resized.jpg
```

#### Optimize Image
```bash
curl -X POST http://localhost:3000/api/optimize \
  -F "file=@your-image.jpg" \
  -F "quality=80" \
  -F "stripMetadata=true" \
  -o optimized.jpg
```

#### Generate Thumbnail
```bash
curl -X POST http://localhost:3000/api/thumbnail \
  -F "file=@your-image.jpg" \
  -F "preset=medium" \
  -o thumbnail.webp
```

#### Extract Metadata
```bash
curl -X POST http://localhost:3000/api/metadata \
  -F "file=@your-image.jpg" \
  -F "operation=extract" \
  -F "includeExif=true"
```

---

## 🧪 Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📖 Learn More

- **Full API Documentation**: See `API_DOCUMENTATION.md`
- **Project Structure**: See `PROJECT_STRUCTURE.md`
- **Complete README**: See `README.md`

---

## 🎨 What You Can Do

### Format Conversion
✅ Convert between JPG, PNG, WebP, AVIF, BMP, TIFF, GIF, SVG, PDF

### Image Transformations
✅ Resize with smart fit strategies
✅ Rotate at any angle
✅ Flip horizontal/vertical
✅ Smart cropping

### Optimization
✅ Compress with quality control
✅ Strip metadata
✅ Progressive rendering
✅ Target file size

### Metadata
✅ Extract EXIF, IPTC, XMP data
✅ Update title, description, author, copyright
✅ Privacy mode (remove all metadata)

### Batch Processing
✅ Process multiple images at once
✅ Same operation on all images
✅ Detailed results for each image

### Thumbnails
✅ Small (256×256)
✅ Medium (512×512)
✅ Large (1024×1024)

---

## 💡 Common Use Cases

### Web Developer
```bash
# Optimize images for website
curl -X POST http://localhost:3000/api/optimize \
  -F "file=@hero-image.jpg" \
  -F "quality=85" \
  -F "format=webp" \
  -o hero-optimized.webp
```

### Photographer
```bash
# Extract photo metadata
curl -X POST http://localhost:3000/api/metadata \
  -F "file=@photo.jpg" \
  -F "operation=extract" \
  -F "includeExif=true" | jq
```

### E-commerce
```bash
# Generate product thumbnails
curl -X POST http://localhost:3000/api/thumbnail \
  -F "file=@product.jpg" \
  -F "preset=large" \
  -o product-thumb.webp
```

### Social Media Manager
```bash
# Resize for Instagram
curl -X POST http://localhost:3000/api/resize \
  -F "file=@original.jpg" \
  -F "width=1080" \
  -F "height=1080" \
  -F "fit=cover" \
  -o instagram.jpg
```

---

## 🔧 Troubleshooting

### Port Already in Use?
```bash
# Use a different port
PORT=3001 npm run dev
```

### Dependencies Not Installing?
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Tests Failing?
```bash
# Make sure you're in the project directory
cd /Users/durga/Desktop/durga/image-editor

# Run tests with verbose output
npm test -- --verbose
```

---

## 🎓 Next Steps

1. ✅ **Explore the UI** - Try all operations with different images
2. ✅ **Test the API** - Use curl or Postman to try endpoints
3. ✅ **Read the code** - Check out `src/lib/image.service.ts`
4. ✅ **Run tests** - See how everything is tested
5. ✅ **Read docs** - Dive into API_DOCUMENTATION.md

---

## 🤝 Need Help?

- Check `README.md` for comprehensive documentation
- Review `API_DOCUMENTATION.md` for API details
- Look at test files for usage examples
- Read inline JSDoc comments in the code

---

## 🎉 You're Ready!

The service is now running and ready to process images. Have fun! 🚀

**Pro Tip**: Start with the web UI to understand capabilities, then move to API integration for your projects.

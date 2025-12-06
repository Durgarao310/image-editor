# Image Processing Service - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

## Overview

The Image Processing Service provides RESTful APIs for comprehensive image manipulation operations. All endpoints accept multipart/form-data for file uploads and return either binary image data or JSON responses.

**Base URL:** `http://localhost:3000/api` (development)

**Supported Input Formats:** JPG, JPEG, PNG, WEBP, AVIF, BMP, TIFF, GIF, SVG

**Supported Output Formats:** JPG, PNG, WEBP, AVIF, PDF, SVG

## Authentication

Currently, the API does not require authentication. For production use, consider implementing:
- API keys
- JWT tokens
- OAuth 2.0

## Endpoints

### 1. Convert Image Format

**Endpoint:** `POST /api/convert`

**Description:** Converts images between different formats with quality control.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Image file to convert |
| format | string | Yes | Target format (jpg, png, webp, avif, pdf) |
| quality | number | No | Quality 1-100 (default: 80) |
| maintainAspectRatio | boolean | No | Maintain aspect ratio (default: true) |
| stripMetadata | boolean | No | Remove all metadata (default: false) |

**Response:** Binary image file

**Response Headers:**
```
Content-Type: image/{format}
Content-Disposition: attachment; filename="{filename}"
X-Processing-Time: {milliseconds}ms
X-Output-Size: {bytes}
X-Output-Format: {format}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/convert \
  -F "file=@image.jpg" \
  -F "format=webp" \
  -F "quality=85" \
  -F "stripMetadata=true" \
  -o output.webp
```

---

### 2. Resize and Transform

**Endpoint:** `POST /api/resize`

**Description:** Resize images with various fit strategies and transformations.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Image file to resize |
| width | number | No | Target width in pixels |
| height | number | No | Target height in pixels |
| fit | string | No | Fit strategy: cover, contain, fill, inside, outside |
| position | string | No | Crop position: center, top, bottom, left, right, etc. |
| rotate | number | No | Rotation angle in degrees |
| flipHorizontal | boolean | No | Flip image horizontally |
| flipVertical | boolean | No | Flip image vertically |
| format | string | No | Output format |
| quality | number | No | Quality 1-100 |
| background | string | No | Background color (hex or rgba) |
| optimizeForWeb | boolean | No | Enable web optimization |

**Fit Strategies:**
- `cover`: Crop to cover both dimensions
- `contain`: Scale to fit inside dimensions
- `fill`: Stretch to fill dimensions
- `inside`: Scale down to fit inside
- `outside`: Scale up to fit outside

**Position Options:**
- `center`, `top`, `right top`, `right`, `right bottom`, `bottom`, `left bottom`, `left`, `left top`
- `north`, `northeast`, `east`, `southeast`, `south`, `southwest`, `west`, `northwest`
- `entropy`: Focus on high-entropy regions
- `attention`: Focus on detected attention areas

**Example:**
```bash
curl -X POST http://localhost:3000/api/resize \
  -F "file=@image.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "fit=cover" \
  -F "position=center" \
  -F "rotate=90" \
  -F "optimizeForWeb=true" \
  -o resized.jpg
```

---

### 3. Metadata Operations

**Endpoint:** `POST /api/metadata`

**Description:** Extract or update image metadata (EXIF, IPTC, XMP).

#### Extract Metadata

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Image file |
| operation | string | Yes | Must be "extract" |
| includeExif | boolean | No | Include EXIF data (default: true) |
| includeIptc | boolean | No | Include IPTC data (default: false) |
| includeXmp | boolean | No | Include XMP data (default: false) |
| includeIcc | boolean | No | Include ICC profile (default: false) |

**Response:** JSON metadata object

**Example Response:**
```json
{
  "success": true,
  "data": {
    "format": "jpeg",
    "width": 1920,
    "height": 1080,
    "space": "srgb",
    "channels": 3,
    "depth": "uchar",
    "density": 72,
    "hasAlpha": false,
    "size": 524288,
    "exif": {
      "Make": "Canon",
      "Model": "EOS 5D Mark IV",
      "DateTime": "2025:12:06 10:30:00",
      "FNumber": 2.8,
      "ISOSpeedRatings": 400
    }
  },
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

#### Update Metadata

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Image file |
| operation | string | Yes | Must be "update" |
| title | string | No | Image title |
| description | string | No | Image description |
| author | string | No | Author/artist name |
| copyright | string | No | Copyright information |
| custom_{key} | string | No | Custom metadata fields |
| stripExisting | boolean | No | Remove existing metadata |

**Response:** Binary image file with updated metadata

**Example:**
```bash
curl -X POST http://localhost:3000/api/metadata \
  -F "file=@image.jpg" \
  -F "operation=update" \
  -F "title=Beautiful Sunset" \
  -F "description=Captured at the beach" \
  -F "author=John Doe" \
  -F "copyright=© 2025 John Doe" \
  -o updated.jpg
```

---

### 4. Optimize Image

**Endpoint:** `POST /api/optimize`

**Description:** Optimize images for web delivery with compression.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Image file to optimize |
| quality | number | No | Quality 1-100 (default: 80) |
| progressive | boolean | No | Enable progressive rendering |
| lossless | boolean | No | Use lossless compression |
| maxFileSize | number | No | Maximum file size in bytes |
| format | string | No | Output format (keeps original if not specified) |
| stripMetadata | boolean | No | Remove metadata |

**Response:** Binary optimized image file

**Response Headers Include:**
```
X-Input-Size: {original_bytes}
X-Output-Size: {optimized_bytes}
X-Compression-Ratio: {percentage}%
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/optimize \
  -F "file=@image.jpg" \
  -F "quality=80" \
  -F "progressive=true" \
  -F "stripMetadata=true" \
  -F "maxFileSize=100000" \
  -o optimized.jpg
```

---

### 5. Generate Thumbnail

**Endpoint:** `POST /api/thumbnail`

**Description:** Generate thumbnails with preset configurations.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Image file |
| preset | string | Yes | Preset name: small, medium, large |

**Preset Configurations:**

| Preset | Dimensions | Format | Quality |
|--------|-----------|--------|---------|
| small | 256×256 | WebP | 80 |
| medium | 512×512 | WebP | 80 |
| large | 1024×1024 | WebP | 85 |

**Response:** Binary thumbnail image

**Example:**
```bash
curl -X POST http://localhost:3000/api/thumbnail \
  -F "file=@image.jpg" \
  -F "preset=medium" \
  -o thumbnail.webp
```

---

### 6. Batch Processing

**Endpoint:** `POST /api/batch`

**Description:** Process multiple images in a single request.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file_1, file_2, ... | File | Yes | Multiple image files (numbered) |
| operation | string | Yes | Operation type: convert, resize, optimize |
| params | JSON string | Yes | Operation parameters as JSON |

**Response:** JSON batch processing results

**Example Response:**
```json
{
  "success": true,
  "data": {
    "totalImages": 3,
    "successCount": 3,
    "failureCount": 0,
    "totalProcessingTime": 1250,
    "results": [
      {
        "format": "webp",
        "size": 45678,
        "width": 800,
        "height": 600,
        "processingTime": 412
      },
      {
        "format": "webp",
        "size": 52341,
        "width": 800,
        "height": 600,
        "processingTime": 438
      },
      {
        "format": "webp",
        "size": 48923,
        "width": 800,
        "height": 600,
        "processingTime": 400
      }
    ]
  },
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/batch \
  -F "file_1=@image1.jpg" \
  -F "file_2=@image2.jpg" \
  -F "file_3=@image3.jpg" \
  -F "operation=optimize" \
  -F 'params={"quality":80,"stripMetadata":true}'
```

## Request/Response Formats

### Content Types

**Request:**
- `multipart/form-data` for file uploads

**Response:**
- `image/jpeg`, `image/png`, `image/webp`, etc. for image responses
- `application/json` for metadata and error responses

### Success Response Format (JSON)

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 413 | Payload Too Large (file size exceeded) |
| 415 | Unsupported Media Type |
| 500 | Internal Server Error |

### Common Errors

**Invalid File Type:**
```json
{
  "success": false,
  "error": "No file provided",
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

**File Too Large:**
```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size of 50 MB",
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

**Invalid Dimensions:**
```json
{
  "success": false,
  "error": "Width exceeds maximum dimension of 10000px",
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

## Rate Limiting

**Recommended for Production:**
- 100 requests per minute per IP
- 1000 requests per hour per IP
- Implement using middleware or API gateway

## Examples

### JavaScript/TypeScript

```typescript
// Convert to WebP
async function convertToWebP(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', 'webp');
  formData.append('quality', '85');

  const response = await fetch('/api/convert', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.blob();
}

// Resize image
async function resizeImage(file: File, width: number, height: number) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('width', width.toString());
  formData.append('height', height.toString());
  formData.append('fit', 'cover');
  formData.append('optimizeForWeb', 'true');

  const response = await fetch('/api/resize', {
    method: 'POST',
    body: formData,
  });

  return await response.blob();
}

// Extract metadata
async function getMetadata(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('operation', 'extract');
  formData.append('includeExif', 'true');

  const response = await fetch('/api/metadata', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
}
```

### Python

```python
import requests

# Convert image
def convert_image(file_path, output_format='webp', quality=85):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {
            'format': output_format,
            'quality': quality,
            'stripMetadata': 'true'
        }
        
        response = requests.post(
            'http://localhost:3000/api/convert',
            files=files,
            data=data
        )
        
        if response.ok:
            with open(f'output.{output_format}', 'wb') as out:
                out.write(response.content)
        else:
            print(f"Error: {response.json()}")

# Resize image
def resize_image(file_path, width=800, height=600):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {
            'width': width,
            'height': height,
            'fit': 'cover',
            'optimizeForWeb': 'true'
        }
        
        response = requests.post(
            'http://localhost:3000/api/resize',
            files=files,
            data=data
        )
        
        if response.ok:
            with open('resized.jpg', 'wb') as out:
                out.write(response.content)
```

### cURL Examples

```bash
# Basic conversion
curl -X POST http://localhost:3000/api/convert \
  -F "file=@input.jpg" \
  -F "format=webp" \
  -o output.webp

# Resize with rotation
curl -X POST http://localhost:3000/api/resize \
  -F "file=@input.jpg" \
  -F "width=1200" \
  -F "height=800" \
  -F "fit=cover" \
  -F "rotate=90" \
  -o resized.jpg

# Optimize with quality settings
curl -X POST http://localhost:3000/api/optimize \
  -F "file=@input.jpg" \
  -F "quality=75" \
  -F "progressive=true" \
  -o optimized.jpg

# Extract metadata
curl -X POST http://localhost:3000/api/metadata \
  -F "file=@input.jpg" \
  -F "operation=extract" \
  -F "includeExif=true" | jq

# Generate thumbnail
curl -X POST http://localhost:3000/api/thumbnail \
  -F "file=@input.jpg" \
  -F "preset=medium" \
  -o thumb.webp
```

## Best Practices

1. **Always check response status** before processing the result
2. **Handle errors gracefully** with appropriate user feedback
3. **Use appropriate quality settings** for your use case (80 is a good default)
4. **Consider file sizes** before processing (check client-side if possible)
5. **Use batch processing** for multiple images to reduce overhead
6. **Implement caching** for frequently processed images
7. **Monitor processing times** via response headers
8. **Use WebP or AVIF** for best compression ratios
9. **Strip metadata** for privacy when not needed
10. **Optimize for web** when serving images on websites

---

**Version:** 1.0.0
**Last Updated:** December 6, 2025

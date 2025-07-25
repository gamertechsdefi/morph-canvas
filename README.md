# Morph Canvas - Free Background Removal Tool

A Next.js application that provides free, decentralized background removal using advanced TypeScript-based image processing algorithms.

## Features

### 🎨 Local Background Removal
- **No external APIs required** - All processing happens locally
- **Multiple algorithms** - Advanced edge detection, color clustering, and flood fill
- **Fallback methods** - Automatic fallback to simpler methods if advanced ones fail
- **Free and decentralized** - No API keys or external dependencies

### 🖼️ Background Replacement
- Upload custom background images
- Automatic resizing and composition
- Support for multiple project types

### 🎯 Color Effects
- Apply custom tints to images
- Adjustable tint intensity
- Real-time preview

## Background Removal Methods

### 1. Advanced Method (Default)
- **Edge Detection**: Uses Sobel operator to detect image edges
- **Color Clustering**: Analyzes corner and edge pixels to find dominant background color
- **Flood Fill**: Creates a mask by flood-filling from edges
- **Mask Application**: Removes background pixels based on the mask

### 2. Color-Based Method
- **Histogram Analysis**: Finds the most common color in the image
- **Tolerance-Based Removal**: Removes pixels similar to the dominant color
- **Simple but effective** for images with uniform backgrounds

### 3. Simple Method
- **Brightness Threshold**: Removes very light or very dark pixels
- **Fast processing** for basic background removal
- **Good for high-contrast images**

### 4. Robust Method (Auto-select)
- **Automatic fallback**: Tries advanced → color-based → simple methods
- **Best success rate** across different image types
- **Recommended for most use cases**

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd morph-canvas

# Install dependencies
npm install
# or
pnpm install

# Run the development server
npm run dev
# or
pnpm dev
```

## Usage

### Background Removal Test
1. Navigate to `/test-bg-removal`
2. Upload an image
3. Select a background removal method
4. Click "Remove Background"
5. Download the processed image

### Background Replacement
1. Navigate to `/bg-fill`
2. Upload an image
3. Select project type and background
4. Click "Update Background"
5. Optionally apply tint effects

### Color Effects
1. Navigate to `/color-effects`
2. Upload an image
3. Apply tint effects
4. Download the processed image

## Technical Details

### Dependencies
- **Next.js 15** - React framework
- **Jimp** - Image processing library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Removed Dependencies
- ~~form-data~~ - No longer needed (removed external API calls)
- ~~formidable~~ - No longer needed (removed external API calls)
- ~~node-fetch~~ - No longer needed (removed external API calls)

### Image Processing Pipeline
1. **Input Validation** - Check file format and size
2. **Background Removal** - Apply selected algorithm
3. **Background Composition** - Overlay on new background
4. **Output Generation** - Return base64 encoded image

## API Endpoints

### `/api/upload`
- **Method**: POST
- **Purpose**: Remove background and apply new background
- **Input**: FormData with image, projectType, backgroundChoice
- **Output**: Base64 encoded processed image

### `/api/test-bg-removal`
- **Method**: POST
- **Purpose**: Test different background removal methods
- **Input**: FormData with image, method
- **Output**: Base64 encoded processed image with method info

### `/api/tint`
- **Method**: POST
- **Purpose**: Apply tint effects to images
- **Input**: FormData with image
- **Output**: Base64 encoded tinted image

### `/api/background-count`
- **Method**: GET
- **Purpose**: Get available backgrounds for project type
- **Input**: Query parameter projectType
- **Output**: Array of background filenames

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # Main upload endpoint
│   │   ├── test-bg-removal/route.ts # Background removal test
│   │   ├── tint/route.ts            # Tint effects
│   │   └── background-count/route.ts # Background listing
│   ├── utils/
│   │   └── image-processing.ts      # Core image processing functions
│   ├── bg-fill/page.tsx             # Background replacement UI
│   ├── test-bg-removal/page.tsx     # Background removal test UI
│   └── color-effects/page.tsx       # Color effects UI
└── components/
    └── Header.tsx                   # Navigation component
```

## Performance

- **Local Processing**: No network latency for background removal
- **Multiple Algorithms**: Automatic fallback ensures high success rate
- **Memory Efficient**: Processes images in chunks
- **Fast Response**: Typical processing time < 2 seconds

## Browser Support

- Modern browsers with ES6+ support
- File API support for image uploads
- Canvas API for image processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.

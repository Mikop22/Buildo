# Image Generation Feature

This module handles image generation using Google Gemini API. It fetches device parts from the webscraping backend and generates images based on the device name and parts list.

## Overview

The image generation flow:
1. **Get Parts**: Fetches the list of parts required for a device from the webscraping backend
2. **Generate Image**: Uses Google Gemini to generate an image based on the device name and parts

## Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create or copy your API key
3. Add it to `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_BACKEND_URL=http://localhost:5000  # Optional, defaults to localhost:5000
```

### 2. Backend Configuration

Make sure your webscraping backend has an endpoint at `/api/parts` that accepts:

```json
{
  "deviceName": "plant",
  "deviceId": "optional-id"
}
```

And returns:

```json
{
  "deviceName": "plant",
  "parts": ["LED grow light", "Water pump", "Battery pack", ...]
}
```

## Usage

### Basic Usage

```typescript
import { getPartsAndGenerateImage } from "./features/image-generation";

// Get parts and generate image in one call
const result = await getPartsAndGenerateImage("battery-powered plant");
console.log(result.imageUrl); // Data URL of the generated image
```

### Step-by-Step Usage

```typescript
import { imageGenerationApi } from "./features/image-generation";

// Step 1: Get parts
const partsData = await imageGenerationApi.getParts({
  deviceName: "battery-powered plant",
});

// Step 2: Generate image
const imageResult = await imageGenerationApi.generateImage({
  deviceName: partsData.deviceName,
  parts: partsData.parts,
});
```

### Using Mock Data

For development, you can use mock parts data:

```typescript
import { fetchPartsMock } from "./features/image-generation";

const parts = await fetchPartsMock({
  deviceName: "plant",
});
```

Or set `USE_MOCK_PARTS = true` in `imageGenerationApi.ts`.

## API Reference

### `getParts(request: PartsRequest): Promise<PartsResponse>`

Fetches parts list from the webscraping backend.

**Request:**
```typescript
{
  deviceName: string;
  deviceId?: string;
}
```

**Response:**
```typescript
{
  deviceName: string;
  parts: string[];
}
```

### `generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse>`

Generates an image using Gemini API.

**Request:**
```typescript
{
  deviceName: string;
  parts: string[];
}
```

**Response:**
```typescript
{
  imageUrl: string;        // Data URL for display
  imageData?: string;      // Base64 encoded image data
}
```

### `getPartsAndGenerateImage(deviceName: string, deviceId?: string): Promise<GenerateImageResponse>`

Convenience function that combines both operations.

## Prompt Format

The prompt sent to Gemini follows this format:

```
can you put together these parts and generate the working model of a {deviceName}:
1. {part1}
2. {part2}
3. {part3}
...
```

**Note:** The `deviceName` comes directly from your webscraping backend. It can be any device name (e.g., "battery-powered plant", "solar robot", "smart sensor", etc.). The backend should return the full device name as it should appear in the prompt.

## Integration with 3D Generation

This image generation feature is designed to work before 3D model generation:

1. **Image Generation** (this module) → Generates reference image
2. **3D Generation** (`mesh3d` module) → Uses image to generate 3D model

Example workflow:

```typescript
// 1. Generate image
const imageResult = await getPartsAndGenerateImage("plant");

// 2. Use image for 3D generation
await generate3D({
  productName: "battery-powered plant",
  images: [imageResult.imageUrl],
});
```

## Troubleshooting

### "VITE_GEMINI_API_KEY is not set" Error
- Make sure `.env.local` exists in the project root
- Verify the variable name is exactly `VITE_GEMINI_API_KEY`
- Restart the dev server after adding the key

### Backend Connection Errors
- Verify `VITE_BACKEND_URL` is correct
- Check that the webscraping backend is running
- Verify the `/api/parts` endpoint exists and returns the expected format

### Gemini API Errors
- Check browser console for detailed error messages
- Verify your API key is valid and has image generation permissions
- Check [Gemini API documentation](https://ai.google.dev/gemini-api/docs) for updates

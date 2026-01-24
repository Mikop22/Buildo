# Quick Start - Testing Without APIs

## Can It Work Without APIs?

**YES!** Everything can work with mocks for development and testing.

## Current Mock Status

### ✅ What Works Without APIs

1. **Parts Fetching** - Uses mock parts data
   - Set `USE_MOCK_PARTS = true` in `imageGenerationApi.ts` ✅ (default)

2. **Image Generation** - Uses mock image
   - Set `USE_MOCK_IMAGE = true` in `imageGenerator.ts` ✅ (default)
   - Returns a placeholder image

3. **3D Generation** - Uses mock 3D models
   - Set `USE_MOCK = true` in `mockApi.ts` ✅ (default)
   - Returns demo GLB files

## How to Test Right Now

### 1. No Setup Required

You can test the complete flow without any API keys:

```typescript
import { getPartsAndGenerateImage } from "./features/image-generation";
import { api } from "./features/mesh3d";

// This works without any API keys!
async function test() {
  // Step 1: Get parts and generate image (uses mocks)
  const image = await getPartsAndGenerateImage("plant");
  console.log("Generated image:", image.imageUrl); // Placeholder image
  
  // Step 2: Generate 3D model (uses mocks)
  const job = await api.generate3D({
    productId: "test-001",
    productName: "plant",
    images: [image.imageUrl],
  });
  
  // Step 3: Get 3D model status (uses mocks)
  const status = await api.get3DStatus(job.jobId);
  console.log("3D Model:", status.modelUrl); // Demo GLB file
}
```

### 2. Test in Your App

Add this to `App.tsx` or create a test component:

```typescript
import { getPartsAndGenerateImage } from "./features/image-generation";

function TestComponent() {
  const handleTest = async () => {
    try {
      const result = await getPartsAndGenerateImage("robot");
      console.log("Image generated:", result.imageUrl);
      // Display the image
      const img = document.createElement("img");
      img.src = result.imageUrl;
      document.body.appendChild(img);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleTest}>Test Image Generation</button>;
}
```

## What Each Mock Does

### Parts Mock (`fetchPartsMock`)
- Returns predefined parts based on device name
- Examples: "plant" → LED grow light, water pump, etc.
- Simulates 500ms network delay

### Image Mock (`generateImageMock`)
- Returns a 1x1 transparent PNG placeholder
- Simulates 1 second generation time
- In production, you'd get real generated images

### 3D Mock (`mockApi`)
- Returns demo GLB files from Khronos repository
- Simulates 2-4 second generation time
- Includes random demo models (Duck, FlightHelmet, etc.)

## Switching to Real APIs

When you're ready to use real APIs:

### 1. Enable Real Image Generation
```typescript
// In src/features/image-generation/imageGenerator.ts
export const USE_MOCK_IMAGE = false; // Use real Gemini API
```

Then add to `.env.local`:
```env
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### 2. Enable Real Parts Backend
```typescript
// In src/features/image-generation/imageGenerationApi.ts
export const USE_MOCK_PARTS = false; // Use real backend
```

Then add to `.env.local`:
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Enable Real 3D Generation
```typescript
// In src/features/mesh3d/mockApi.ts
export const USE_MOCK = false; // Use real Meshy API
```

Then add to `.env.local`:
```env
VITE_MESHY_API_KEY=your_meshy_key_here
```

## Summary

| Feature | Mock Available | Needs API Key |
|---------|----------------|---------------|
| Parts Fetching | ✅ Yes | ❌ No (uses mock) |
| Image Generation | ✅ Yes | ❌ No (uses mock) |
| 3D Generation | ✅ Yes | ❌ No (uses mock) |

**You can test everything right now without any API keys!**

Just run:
```bash
npm run dev
```

And use the code - it will work with mocks automatically.

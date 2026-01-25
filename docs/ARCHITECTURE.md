# Project Architecture & Implementation

## What Was Just Implemented

You now have a **complete image generation feature** that integrates with your existing 3D generation pipeline.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Complete Workflow                         │
└─────────────────────────────────────────────────────────────┘

1. User Input (Device Name)
   │
   ▼
2. Get Parts from Backend
   │  ┌─────────────────────┐
   │  │ Webscraping Backend │  (on main branch)
   │  │ POST /api/parts     │
   │  └─────────────────────┘
   │
   ▼
3. Generate Image with Gemini
   │  ┌─────────────────────┐
   │  │ Google Gemini API    │  (Nano Banana)
   │  │ Image Generation     │
   │  └─────────────────────┘
   │
   ▼
4. Generate 3D Model with Meshy
   │  ┌─────────────────────┐
   │  │ Meshy API           │
   │  │ 3D Model Generation │
   │  └─────────────────────┘
   │
   ▼
5. Display 3D Model
   │  ┌─────────────────────┐
   │  │ React Three Fiber   │
   │  │ Interactive Viewer  │
   │  └─────────────────────┘
```

## What You Have Now

### ✅ Image Generation Feature (`src/features/image-generation/`)

**Purpose**: Generate product images using Google Gemini before creating 3D models.

**Components**:

1. **`api.ts`** - TypeScript interfaces
   - `PartsRequest` - Request format for getting parts
   - `PartsResponse` - Response format with device name and parts list
   - `GenerateImageRequest` - Request format for image generation
   - `GenerateImageResponse` - Response with generated image

2. **`config.ts`** - Configuration
   - Gemini API key management
   - Backend URL configuration
   - API endpoints

3. **`partsApi.ts`** - Backend integration
   - `fetchPartsFromBackend()` - Calls webscraping backend
   - `fetchPartsMock()` - Mock data for development

4. **`imageGenerator.ts`** - Gemini integration
   - `generateImageWithGemini()` - Calls Gemini API
   - Builds prompt: "can you put together these parts and generate the working model of a {deviceName}"

5. **`imageGenerationApi.ts`** - Main API
   - Combines parts fetching + image generation
   - `getPartsAndGenerateImage()` - One function to do everything

6. **`index.ts`** - Public exports

### ✅ 3D Generation Feature (`src/features/mesh3d/`)

**Purpose**: Generate and display 3D models using Meshy API.

**Already existed** - This was your existing feature.

## How It Works Together

### Current Flow (What You Can Do Now)

```typescript
// Step 1: Get parts and generate image
import { getPartsAndGenerateImage } from "./features/image-generation";

const imageResult = await getPartsAndGenerateImage("battery-powered plant");
// Returns: { imageUrl: "data:image/png;base64,...", imageData: "..." }

// Step 2: Use image for 3D generation
import { api } from "./features/mesh3d";

const job = await api.generate3D({
  productId: "plant-001",
  productName: "battery-powered plant",
  images: [imageResult.imageUrl], // Pass the generated image
  dimensions: { width: 10, height: 5, depth: 3 }
});

// Step 3: Poll for 3D model completion
const status = await api.get3DStatus(job.jobId);
// Returns: { status: "SUCCEEDED", modelUrl: "..." }
```

### Complete Integration Example

```typescript
async function generateProductVisualization(deviceName: string) {
  try {
    // 1. Get parts from backend and generate image
    console.log("Step 1: Generating image...");
    const image = await getPartsAndGenerateImage(deviceName);
    
    // 2. Generate 3D model from image
    console.log("Step 2: Generating 3D model...");
    const job = await api.generate3D({
      productId: `device-${Date.now()}`,
      productName: deviceName,
      images: [image.imageUrl],
    });
    
    // 3. Wait for 3D model
    console.log("Step 3: Waiting for 3D model...");
    let status = await api.get3DStatus(job.jobId);
    while (status.status === "RUNNING") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      status = await api.get3DStatus(job.jobId);
    }
    
    if (status.status === "SUCCEEDED") {
      console.log("3D Model ready:", status.modelUrl);
      return status.modelUrl;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## Project Structure

```
conuhacks26/
├── src/
│   ├── features/
│   │   ├── image-generation/     ← NEW: Image generation with Gemini
│   │   │   ├── api.ts            (TypeScript interfaces)
│   │   │   ├── config.ts         (API keys, URLs)
│   │   │   ├── partsApi.ts        (Backend integration)
│   │   │   ├── imageGenerator.ts (Gemini API calls)
│   │   │   ├── imageGenerationApi.ts (Main API)
│   │   │   ├── index.ts          (Exports)
│   │   │   └── README.md
│   │   │
│   │   └── mesh3d/               ← EXISTING: 3D generation
│   │       ├── api.ts
│   │       ├── mockApi.ts
│   │       ├── ModelViewer.tsx
│   │       ├── ModelPanel.tsx
│   │       └── use3DJob.ts
│   │
│   └── App.tsx                   (Main app - can integrate both)
│
├── docs/
│   ├── API_SETUP.md              (How to set up API keys)
│   ├── INTEGRATION.md             (How to integrate)
│   ├── BACKEND_INFO.md            (Backend details)
│   └── ARCHITECTURE.md            (This file)
│
└── README.md
```

## Current Status

### ✅ What Works Now

1. **Image Generation** - Fully implemented
   - Can generate images using Gemini
   - Uses mock parts data (for development)
   - Ready to connect to real backend

2. **3D Generation** - Already working
   - Can generate 3D models using Meshy
   - Has interactive viewer
   - Can use images as input

3. **Integration Ready** - Code is ready to connect them

### ⚠️ What Needs Setup

1. **API Keys** (in `.env.local`):
   ```env
   VITE_GEMINI_API_KEY=your_key_here
   VITE_MESHY_API_KEY=your_key_here  (you already have this)
   VITE_BACKEND_URL=http://localhost:5000
   ```

2. **Backend Endpoint** (on main branch):
   - Add `/api/parts` endpoint to `backend/app.py`
   - OR modify frontend to use existing `/generate` endpoint
   - See `docs/BACKEND_INFO.md` for details

3. **Switch to Real Backend**:
   - Set `USE_MOCK_PARTS = false` in `imageGenerationApi.ts`
   - Make sure backend is running

## How to Use

### Development (Using Mocks)

```typescript
import { getPartsAndGenerateImage } from "./features/image-generation";

// This works right now with mock data
const result = await getPartsAndGenerateImage("plant");
console.log(result.imageUrl); // Generated image
```

### Production (With Real Backend)

1. Set up backend endpoint (see `docs/BACKEND_INFO.md`)
2. Set `USE_MOCK_PARTS = false`
3. Add API keys to `.env.local`
4. Run backend: `python backend/app.py`
5. Use the same code - it will call real backend

## Benefits

1. **Separation of Concerns**: Each feature is self-contained
2. **Reusable**: Image generation can be used independently
3. **Testable**: Mock implementations for development
4. **Flexible**: Easy to switch between mock and real APIs
5. **Type-Safe**: Full TypeScript interfaces

## Next Steps

1. **Test Image Generation**:
   ```typescript
   // In App.tsx or a test component
   const test = async () => {
     const img = await getPartsAndGenerateImage("robot");
     // Display the image
   };
   ```

2. **Integrate with 3D Generation**:
   - Update `App.tsx` to use image generation first
   - Pass generated image to 3D generation

3. **Connect to Backend**:
   - Add `/api/parts` endpoint to backend
   - Test end-to-end flow

4. **UI Integration**:
   - Add UI for image generation step
   - Show generated image before 3D generation
   - Create complete workflow UI

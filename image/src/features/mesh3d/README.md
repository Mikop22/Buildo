# 3D Generation & Visualization Module

A self-contained module for generating and visualizing 3D models from product data.

## Overview

This module provides a complete frontend solution for:
- Initiating 3D model generation jobs
- Polling job status
- Displaying interactive 3D models (GLB format)

**Current Status:** Backend is **mocked** for development and demo purposes. The module is designed to seamlessly switch to a real Meshy backend when ready.

## Architecture

All files are located in `src/features/mesh3d/`:

- **`api.ts`** - Final API contracts (never change these)
- **`mockApi.ts`** - Mock backend implementation (simulates Meshy)
- **`use3DJob.ts`** - React hook for job management
- **`ModelViewer.tsx`** - 3D GLB viewer component
- **`ModelPanel.tsx`** - Complete UI wrapper (entry point)
- **`README.md`** - This file

## Usage

### Quick Start

```tsx
import { ModelPanel } from "./features/mesh3d/ModelPanel";

function App() {
  return (
    <ModelPanel
      productId="product-123"
      productName="My Product"
      dimensions={{ width: 10, height: 5, depth: 3 }}
    />
  );
}
```

### Using the Hook Directly

```tsx
import { use3DJob } from "./features/mesh3d/use3DJob";

function CustomComponent() {
  const { generate, status, modelUrl, error, retry } = use3DJob();

  const handleGenerate = () => {
    generate({
      productId: "123",
      productName: "Product",
    });
  };

  return (
    <div>
      {status === "SUCCEEDED" && modelUrl && (
        <ModelViewer modelUrl={modelUrl} />
      )}
    </div>
  );
}
```

## Backend Integration

### Current: Mock Backend

The module uses `mockApi.ts` which simulates Meshy behavior:
- Returns job IDs immediately
- Simulates 2-4 second processing time
- Returns a demo GLB URL

Set `USE_MOCK = false` in `mockApi.ts` to switch to real backend.

### Future: Real Meshy Backend

When the backend is ready:

1. **Update `mockApi.ts`**: Set `USE_MOCK = false`
2. **Implement `realApi`**: Replace the placeholder fetch calls with actual Meshy API endpoints
3. **No UI changes needed**: The API interface remains the same

The API contracts in `api.ts` are **final** and must not change to ensure smooth backend integration.

## API Contracts

### Generate3DRequest
```typescript
{
  productId: string;
  productName: string;
  images?: string[];
  dimensions?: { width?: number; height?: number; depth?: number };
}
```

### Generate3DResponse
```typescript
{
  jobId: string;
  status: "RUNNING";
}
```

### JobStatusResponse
```typescript
{
  status: "RUNNING" | "SUCCEEDED" | "FAILED";
  modelUrl?: string;
  error?: string;
}
```

## Features

### ModelViewer
- ✅ Orbit controls (rotate, zoom, pan)
- ✅ Soft lighting + environment lighting
- ✅ Auto-center model
- ✅ Auto-rotate toggle
- ✅ Reset camera button
- ✅ Automatic scaling based on dimensions

### ModelPanel
- ✅ Complete UI flow (Generate → Loading → View)
- ✅ Error handling with retry
- ✅ Loading states with friendly messages
- ✅ Responsive design

## Dependencies

- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for R3F
- `three` - 3D library

## Notes

- The module is **self-contained** and can be easily moved or deleted
- All logic lives in this folder (no scattered dependencies)
- Designed for easy backend integration later
- Works immediately with mock data

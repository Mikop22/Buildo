# Integration Guide

## Backend Integration

### Webscraping Backend

The image generation feature expects a webscraping backend endpoint at `/api/parts`:

**Request:**
```json
POST /api/parts
{
  "deviceName": "plant",
  "deviceId": "optional-id"
}
```

**Response:**
```json
{
  "deviceName": "plant",
  "parts": ["LED grow light", "Water pump", "Battery pack", ...]
}
```

### Flask Backend (Main Branch)

If you're integrating with the Flask backend from the main branch:

1. Ensure the backend has the `/api/parts` endpoint
2. Set `VITE_BACKEND_URL` in `.env.local` to point to your backend
3. Set `USE_MOCK_PARTS = false` in `src/features/image-generation/imageGenerationApi.ts`

### 3D Generation Integration

The image generation feature is designed to work with the 3D mesh generation:

1. **Image Generation** → Generates reference image using Gemini
2. **3D Generation** → Uses image to generate 3D model using Meshy

Example workflow:

```typescript
import { getPartsAndGenerateImage } from "./features/image-generation";
import { api } from "./features/mesh3d";

// 1. Generate image
const imageResult = await getPartsAndGenerateImage("battery-powered plant");

// 2. Use image for 3D generation
const job = await api.generate3D({
  productId: "plant-001",
  productName: "battery-powered plant",
  images: [imageResult.imageUrl],
});
```

## Frontend Integration

### Using Image Generation in Components

```typescript
import { getPartsAndGenerateImage } from "./features/image-generation";

function MyComponent() {
  const handleGenerate = async () => {
    try {
      const result = await getPartsAndGenerateImage("plant");
      // Use result.imageUrl to display the image
      console.log("Generated image:", result.imageUrl);
    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  };

  return <button onClick={handleGenerate}>Generate Image</button>;
}
```

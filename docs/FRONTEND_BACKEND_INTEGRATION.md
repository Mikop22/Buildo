# Frontend-Backend Integration Analysis

## Overview

This document analyzes how to integrate the image generation feature with:
- **Frontend**: Next.js app in `frontend/` folder
- **Backend**: Flask app in `backend/` folder

**Note**: The React/Vite app in `src/` is a separate prototype/demo, not the main frontend.

## Current State

### Frontend (`frontend/` folder)
- **Framework**: Next.js 16.1.4
- **Current State**: Static landing page with retro pixel theme
- **No API integration**: Currently no backend calls
- **Structure**:
  - `app/page.js` - Main page component
  - `app/layout.js` - Root layout
  - `app/globals.css` - Global styles
  - Uses NES.css for retro styling

### Backend (`backend/` folder)
- **Framework**: Flask
- **Current Endpoint**: `POST /generate`
  - Request: `{ "description": "device description" }`
  - Response: Parts by category, firmware, assembly steps
- **Services Available**:
  - `services/gemini.py` - `fetch_parts_by_category(description)`
  - `services/parts_catalog.py` - Parts catalog data
  - `services/snowflake.py` - Code generation
  - `services/cache.py` - Caching

### Image Generation Feature (`src/features/image-generation/`)
- **Status**: Complete implementation (prototype)
- **Components**: ImagePanel, ImageViewer, API layer
- **Can be adapted**: Code can be ported to Next.js frontend

## Integration Strategy

### Option 1: Add Backend Endpoint + Integrate in Next.js (Recommended)

#### Step 1: Add `/api/parts` Endpoint to Backend

**File**: `backend/app.py`

```python
@app.route('/api/parts', methods=['POST'])
def get_parts():
    data = request.get_json()
    device_name = data.get('deviceName', '')
    device_id = data.get('deviceId')
    
    # Use existing Gemini service
    parts_by_category = fetch_parts_by_category(device_name)
    
    # Transform to simple parts list format
    parts_list = []
    for category, items in parts_by_category.items():
        if category not in ['firmware', 'assembly_steps']:
            for item in items:
                if isinstance(item, dict) and 'title' in item:
                    parts_list.append(item['title'])
    
    return jsonify({
        'deviceName': device_name,
        'parts': parts_list
    })
```

#### Step 2: Add Image Generation Endpoint to Backend

**File**: `backend/app.py`

```python
import os
import requests
from flask_cors import CORS

CORS(app)  # Enable CORS for frontend

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    data = request.get_json()
    device_name = data.get('deviceName', '')
    parts = data.get('parts', [])
    
    # Get Gemini API key from environment
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        return jsonify({'error': 'GEMINI_API_KEY not configured'}), 500
    
    # Build prompt
    parts_list = '\n'.join([f"{i+1}. {part}" for i, part in enumerate(parts)])
    prompt = f"can you put together these parts and generate the working model of a {device_name}:\n{parts_list}"
    
    # Call Gemini API
    try:
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={gemini_api_key}",
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "responseModalities": ["TEXT", "IMAGE"],
                    "temperature": 0.7
                }
            }
        )
        
        if response.status_code != 200:
            return jsonify({'error': 'Gemini API error'}), 500
        
        data = response.json()
        # Extract image data (adjust based on actual Gemini response format)
        image_data = extract_image_from_response(data)
        
        return jsonify({
            'imageUrl': f"data:image/png;base64,{image_data}",
            'imageData': image_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

#### Step 3: Create Next.js API Client

**File**: `frontend/lib/api.js` (create new file)

```javascript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function getParts(deviceName, deviceId) {
  const response = await fetch(`${BACKEND_URL}/api/parts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deviceName,
      deviceId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch parts');
  }

  return response.json();
}

export async function generateImage(deviceName, parts) {
  const response = await fetch(`${BACKEND_URL}/api/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deviceName,
      parts,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  return response.json();
}

export async function getPartsAndGenerateImage(deviceName, deviceId) {
  // First get parts
  const partsData = await getParts(deviceName, deviceId);
  
  // Then generate image
  return generateImage(partsData.deviceName, partsData.parts);
}
```

#### Step 4: Create Image Generation Component

**File**: `frontend/components/ImageGenerator.js` (create new file)

```javascript
'use client';

import { useState } from 'react';
import { getPartsAndGenerateImage } from '../lib/api';
import styles from './ImageGenerator.module.css';

export default function ImageGenerator() {
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const result = await getPartsAndGenerateImage(deviceName);
      setImageUrl(result.imageUrl);
    } catch (err) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nes-container is-rounded">
      <h2 className="title">Generate Product Image</h2>
      
      <div className={styles.inputGroup}>
        <div className="nes-field">
          <label>Device Name</label>
          <input
            type="text"
            className="nes-input"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g., battery-powered plant"
            disabled={loading}
          />
        </div>
        
        <button
          className="nes-btn is-primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && (
        <div className="nes-container is-rounded is-error">
          <p>Error: {error}</p>
        </div>
      )}

      {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={deviceName} className={styles.generatedImage} />
        </div>
      )}
    </div>
  );
}
```

#### Step 5: Integrate into Main Page

**File**: `frontend/app/page.js`

Add the ImageGenerator component to the page:

```javascript
import ImageGenerator from '../components/ImageGenerator';

// In the component, add a new section:
<section className={styles.imageGeneration}>
  <ImageGenerator />
</section>
```

### Option 2: Use Next.js API Routes (Alternative)

Instead of calling backend directly, use Next.js API routes as a proxy:

**File**: `frontend/app/api/parts/route.js`

```javascript
export async function POST(request) {
  const { deviceName, deviceId } = await request.json();
  
  const response = await fetch(`${process.env.BACKEND_URL}/api/parts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceName, deviceId }),
  });
  
  return Response.json(await response.json());
}
```

Then call from frontend:
```javascript
const response = await fetch('/api/parts', { ... });
```

## Data Flow

```
┌─────────────────────────────────────────┐
│   Next.js Frontend (frontend/)          │
│                                         │
│   User Input → ImageGenerator Component │
│   ↓                                     │
│   getPartsAndGenerateImage()            │
└─────────────────────────────────────────┘
           │
           │ HTTP POST
           ▼
┌─────────────────────────────────────────┐
│   Flask Backend (backend/)               │
│                                         │
│   POST /api/parts                       │
│   → fetch_parts_by_category()           │
│   → Transform to parts list             │
│   ↓                                     │
│   POST /api/generate-image              │
│   → Call Gemini API                     │
│   → Return image data                   │
└─────────────────────────────────────────┘
           │
           │ JSON Response
           ▼
┌─────────────────────────────────────────┐
│   Frontend displays image               │
└─────────────────────────────────────────┘
```

## Environment Variables

### Backend (`.env` or environment)
```env
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Required Changes Summary

### Backend Changes
1. ✅ Add `/api/parts` endpoint
2. ✅ Add `/api/generate-image` endpoint
3. ✅ Add CORS support (`flask-cors`)
4. ✅ Add Gemini API integration
5. ✅ Add environment variable for Gemini API key

### Frontend Changes
1. ✅ Create API client (`lib/api.js`)
2. ✅ Create ImageGenerator component
3. ✅ Integrate into main page
4. ✅ Add environment variable for backend URL

## Testing Checklist

### Backend
- [ ] `/api/parts` returns correct format
- [ ] `/api/generate-image` calls Gemini API
- [ ] CORS headers are set correctly
- [ ] Error handling works

### Frontend
- [ ] API client functions work
- [ ] ImageGenerator component renders
- [ ] Image generation flow works end-to-end
- [ ] Error states display correctly
- [ ] Loading states work

### Integration
- [ ] Frontend can call backend endpoints
- [ ] Images display correctly
- [ ] Error messages are user-friendly
- [ ] CORS issues resolved

## Dependencies to Add

### Backend
```bash
pip install flask-cors requests
```

### Frontend
No additional dependencies needed (uses built-in `fetch`)

## Next Steps

1. **Add backend endpoints** (Option 1, Step 1-2)
2. **Create frontend API client** (Option 1, Step 3)
3. **Create ImageGenerator component** (Option 1, Step 4)
4. **Integrate into page** (Option 1, Step 5)
5. **Test end-to-end flow**
6. **Add error handling and loading states**
7. **Style to match retro theme**

## Notes

- The prototype code in `src/features/image-generation/` can be used as reference
- Backend endpoints should match the expected request/response formats
- Consider adding caching for generated images
- Add rate limiting for production use
- Consider using Next.js Image component for optimized image display

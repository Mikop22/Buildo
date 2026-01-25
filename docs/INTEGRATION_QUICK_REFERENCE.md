# Integration Quick Reference

## Integration Points Summary

### 1. Frontend → Backend Connection

**Current State**: Frontend expects `/api/parts` endpoint (doesn't exist yet)

**What Frontend Sends**:
```typescript
POST /api/parts
{
  deviceName: "battery-powered plant",
  deviceId?: "optional-id"
}
```

**What Frontend Expects**:
```typescript
{
  deviceName: "battery-powered plant",
  parts: ["LED grow light", "Water pump", "Battery pack", ...]
}
```

**What Backend Currently Provides**:
```python
POST /generate
{
  description: "battery-powered plant"
}
# Returns complex nested structure with parts by category
```

### 2. Integration Solutions

#### Solution A: Add Backend Endpoint (Recommended)
- **File**: `backend/app.py`
- **Add**: New `/api/parts` route
- **Reuse**: Existing `fetch_parts_by_category()` service
- **Transform**: Extract part titles into simple array
- **Frontend Changes**: None (just set `USE_MOCK_PARTS = false`)

#### Solution B: Adapt Frontend
- **File**: `src/features/image-generation/partsApi.ts`
- **Change**: Call `/generate` instead of `/api/parts`
- **Add**: Response transformation logic
- **Backend Changes**: None

### 3. Configuration Flags

**Location**: `src/features/image-generation/imageGenerationApi.ts`
```typescript
export const USE_MOCK_PARTS = true;  // Change to false for real backend
```

**Location**: `src/features/image-generation/imageGenerator.ts`
```typescript
export const USE_MOCK_IMAGE = true;  // Change to false for real Gemini API
```

### 4. Environment Variables

**File**: `.env.local` (create in project root)
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_key_here
VITE_MESHY_API_KEY=your_key_here  # Optional, for 3D
```

### 5. Data Transformation

**Backend Response Format** (current):
```python
{
  "controller": [{"title": "ESP32", ...}, ...],
  "power": [{"title": "Battery", ...}, ...],
  ...
}
```

**Frontend Needs**:
```typescript
{
  deviceName: string,
  parts: ["ESP32", "Battery", ...]  // Simple string array
}
```

**Transformation Logic**:
```python
parts_list = []
for category, items in parts_by_category.items():
    if category not in ['firmware', 'assembly_steps']:
        for item in items:
            parts_list.append(item['title'])
```

### 6. Workflow Integration

**Current 2D Flow**:
```
User → ImagePanel → getPartsAndGenerateImage() → Display Image
```

**Current 3D Flow**:
```
User → ModelPanel → api.generate3D({ images: [...] }) → Display 3D Model
```

**Potential Combined Flow**:
```
User → Generate 2D Image → Use Image for 3D Generation → Display 3D Model
```

### 7. Files That Need Changes

#### If Using Solution A (Add Backend Endpoint):
- ✅ `backend/app.py` - Add new route
- ✅ `.env.local` - Add environment variables
- ✅ `src/features/image-generation/imageGenerationApi.ts` - Set `USE_MOCK_PARTS = false`
- ✅ `src/features/image-generation/imageGenerator.ts` - Set `USE_MOCK_IMAGE = false` (optional)

#### If Using Solution B (Adapt Frontend):
- ✅ `src/features/image-generation/partsApi.ts` - Update fetch logic
- ✅ `.env.local` - Add environment variables
- ✅ `src/features/image-generation/imageGenerationApi.ts` - Set `USE_MOCK_PARTS = false`
- ✅ `src/features/image-generation/imageGenerator.ts` - Set `USE_MOCK_IMAGE = false` (optional)

### 8. Testing Steps

1. **Start Backend**: `python backend/app.py`
2. **Start Frontend**: `npm run dev`
3. **Test 2D Generation**: 
   - Select "2D Image" mode
   - Enter product name
   - Click "Generate 2D Image"
   - Verify: Parts fetched → Image generated → Image displayed

4. **Test 3D Generation** (optional):
   - Generate 2D image first
   - Switch to "3D Model" mode
   - Verify generated image is pre-populated
   - Generate 3D model

### 9. Error Scenarios

| Scenario | Current Behavior | Should Handle |
|----------|------------------|---------------|
| Backend not running | Network error | Show user-friendly message |
| Backend returns error | Throws exception | Display error in UI |
| Gemini API key missing | Throws error | Show setup instructions |
| Invalid device name | Backend may return empty | Handle gracefully |
| CORS issues | Browser blocks request | Add CORS headers to backend |

### 10. Key Integration Files

**Frontend**:
- `src/features/image-generation/partsApi.ts` - Backend communication
- `src/features/image-generation/imageGenerationApi.ts` - Main API
- `src/features/image-generation/config.ts` - Configuration
- `src/App.tsx` - UI integration

**Backend**:
- `backend/app.py` - Flask routes
- `backend/services/gemini.py` - Parts fetching service
- `backend/services/parts_catalog.py` - Parts data

## Decision Matrix

| Factor | Solution A (New Endpoint) | Solution B (Adapt Frontend) |
|--------|---------------------------|----------------------------|
| Backend Changes | ✅ Required | ❌ None |
| Frontend Changes | ❌ None | ✅ Required |
| Code Complexity | Low | Medium |
| Maintainability | High | Medium |
| Performance | Better (smaller response) | Good |
| **Recommendation** | ⭐ **Preferred** | Alternative |

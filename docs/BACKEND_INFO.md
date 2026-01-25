# Backend Information

## Where is the Backend?

The backend is **on the MAIN branch**, not on your current branch (`meshy3DvisualImplementation`).

### Backend Location
- **Branch**: `main` (or `origin/main`)
- **Path**: `backend/app.py`
- **Type**: Flask application

## Current Backend Structure (from Main Branch)

The backend on main has:

1. **Flask App** (`backend/app.py`)
   - Endpoint: `POST /generate`
   - Takes: `{ "description": "device description" }`
   - Returns: Parts by category, firmware, assembly steps

2. **Services**:
   - `backend/services/gemini.py` - Uses Gemini to fetch parts by category
   - `backend/services/parts_catalog.py` - Parts catalog data
   - `backend/services/snowflake.py` - Code generation
   - `backend/services/cache.py` - Caching

## Integration Options

### Option 1: Add `/api/parts` Endpoint to Backend (Recommended)

Add a new endpoint to `backend/app.py` on the main branch:

```python
@app.route('/api/parts', methods=['POST'])
def get_parts():
    data = request.get_json()
    device_name = data.get('deviceName', '')
    device_id = data.get('deviceId')
    
    # Use existing Gemini service to get parts
    parts_by_category = fetch_parts_by_category(device_name)
    
    # Convert to simple parts list format
    parts_list = []
    for category, items in parts_by_category.items():
        if category not in ['firmware', 'assembly_steps']:
            for item in items:
                parts_list.append(item.get('title', ''))
    
    return jsonify({
        'deviceName': device_name,
        'parts': parts_list
    })
```

### Option 2: Modify Frontend to Use Existing `/generate` Endpoint

Update `src/features/image-generation/partsApi.ts` to call `/generate` instead:

```typescript
const response = await fetch(`${backendUrl}/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    description: request.deviceName, // Use description instead
  }),
});

// Then extract parts from the response format
const data = await response.json();
const parts = [];
for (const [category, items] of Object.entries(data)) {
  if (category !== 'firmware' && category !== 'assembly_steps') {
    items.forEach((item: any) => {
      parts.push(item.title);
    });
  }
}
```

### Option 3: Run Backend Separately

1. Switch to main branch (or have it running separately)
2. Start the Flask backend: `python backend/app.py`
3. Set `VITE_BACKEND_URL=http://localhost:5000` in `.env.local`
4. Add the `/api/parts` endpoint (Option 1) or modify frontend (Option 2)

## Current Status

- ✅ Frontend code is ready to call backend
- ⚠️ Backend endpoint `/api/parts` doesn't exist yet
- ✅ Backend has Gemini integration already
- ✅ Backend has parts fetching logic

## Next Steps

1. **Decide which option** you want (add endpoint or modify frontend)
2. **If adding endpoint**: Switch to main branch, add the endpoint, test it
3. **If modifying frontend**: Update `partsApi.ts` to match existing backend format
4. **Set `USE_MOCK_PARTS = false`** in `src/features/image-generation/imageGenerationApi.ts` when ready

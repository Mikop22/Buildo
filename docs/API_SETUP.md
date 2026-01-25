# API Setup Guide

This guide covers setting up API keys for all services used in this project.

## Required API Keys

### 1. Google Gemini API Key (for Image Generation)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create or copy your API key
3. Add to `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Meshy API Key (for 3D Generation)

1. Sign up or log in to [Meshy.ai](https://meshy.ai)
2. Navigate to your API settings/dashboard
3. Copy your API key
4. Add to `.env.local`:

```env
VITE_MESHY_API_KEY=your_meshy_api_key_here
```

### 3. Backend URL (Optional)

If your webscraping backend is running on a different URL:

```env
VITE_BACKEND_URL=http://localhost:5000
```

## Environment File Setup

1. **Create `.env.local` file** in the project root (same level as `package.json`)
2. **Add all your API keys** (see above)
3. **Never commit `.env.local`** - it's already in `.gitignore`
4. **Restart your dev server** after adding/modifying environment variables

## Example `.env.local`

```env
VITE_GEMINI_API_KEY=AIzaSy...
VITE_MESHY_API_KEY=meshy_...
VITE_BACKEND_URL=http://localhost:5000
```

## Troubleshooting

### "API key is not set" Errors
- Make sure `.env.local` exists in the project root
- Verify variable names match exactly (case-sensitive)
- Restart the dev server after creating/modifying `.env.local`

### API Errors
- Check browser console for detailed error messages
- Verify your API keys are valid and have the right permissions
- Check API documentation for correct endpoint URLs and request formats

### CORS Issues
- If calling APIs directly from the browser causes CORS errors, use a backend proxy
- Or configure the APIs to allow your domain

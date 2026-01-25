/**
 * Configuration for Image Generation
 * 
 * Manages API keys and backend URLs
 */

/**
 * Get Gemini API key from environment variables
 */
export const getGeminiApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Please add it to your .env.local file."
    );
  }
  return apiKey;
};

/**
 * Get webscraping backend base URL
 * Defaults to localhost:5000 if not set
 */
export const getBackendUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
};

/**
 * Gemini API configuration
 * 
 * Nano Banana models for image generation:
 * - gemini-2.5-flash-image: Fast image generation
 * - gemini-3-pro-image-preview: Higher quality image generation
 */
export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
export const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image"; // Nano Banana model for image generation

/**
 * Image Generation Service using Google Gemini
 * 
 * Generates images based on device name and parts list
 */

import { getGeminiApiKey, GEMINI_API_BASE, GEMINI_IMAGE_MODEL } from "./config";
import type { GenerateImageRequest, GenerateImageResponse } from "./api";

// Set to false to use real Gemini API (requires VITE_GEMINI_API_KEY in .env.local)
export const USE_MOCK_IMAGE = true; // Default to mock for development

/**
 * Constructs the prompt for Gemini image generation
 * 
 * The deviceName comes from the webscraping backend and should include
 * the full device description (e.g., "battery-powered plant", "solar robot", etc.)
 */
function buildPrompt(deviceName: string, parts: string[]): string {
  const partsList = parts.map((part, index) => `${index + 1}. ${part}`).join("\n");
  
  return `can you put together these parts and generate the working model of a ${deviceName}:\n${partsList}`;
}

/**
 * Mock image generation for development/testing
 * Returns a placeholder image
 */
async function generateImageMock(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return a placeholder image (1x1 transparent PNG in base64)
  // In a real mock, you could return a sample image URL or generate a simple SVG
  const placeholderImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  
  return {
    imageUrl: `data:image/png;base64,${placeholderImage}`,
    imageData: placeholderImage,
  };
}

/**
 * Generates an image using Google Gemini API
 */
export async function generateImageWithGemini(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  // Use mock if enabled
  if (USE_MOCK_IMAGE) {
    return generateImageMock(request);
  }

  const apiKey = getGeminiApiKey();
  const prompt = buildPrompt(request.deviceName, request.parts);

  try {
    // Gemini API endpoint for image generation
    // Using the generateContent endpoint with image generation enabled
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `Gemini API error: ${response.statusText} (${response.status})`
      );
    }

    const data = await response.json();

    // Extract image data from response
    // Gemini returns image data in the response
    const imageData = extractImageFromResponse(data);

    if (!imageData) {
      throw new Error("No image data returned from Gemini API");
    }

    // Convert base64 to data URL for display
    const imageUrl = `data:image/png;base64,${imageData}`;

    return {
      imageUrl,
      imageData,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate image with Gemini API");
  }
}

/**
 * Extracts image data from Gemini API response
 */
function extractImageFromResponse(response: any): string | null {
  try {
    // Gemini API response structure may vary
    // Check for image data in various possible locations
    const candidates = [
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data,
      response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data,
      response.imageData,
      response.data,
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === "string") {
        // Remove data URL prefix if present
        return candidate.replace(/^data:image\/[^;]+;base64,/, "");
      }
    }

    return null;
  } catch {
    return null;
  }
}

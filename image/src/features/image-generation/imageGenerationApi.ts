/**
 * Complete Image Generation API Implementation
 * 
 * Combines parts fetching and image generation
 */

import { fetchPartsFromBackend, fetchPartsMock } from "./partsApi";
import { generateImageWithGemini, USE_MOCK_IMAGE } from "./imageGenerator";
import type {
  IImageGenerationAPI,
  PartsRequest,
  PartsResponse,
  GenerateImageRequest,
  GenerateImageResponse,
} from "./api";

// Set to false to use real backend (requires VITE_BACKEND_URL in .env.local)
export const USE_MOCK_PARTS = true; // Default to mock for development

/**
 * Complete Image Generation API
 */
export const imageGenerationApi: IImageGenerationAPI = {
  async getParts(request: PartsRequest): Promise<PartsResponse> {
    if (USE_MOCK_PARTS) {
      return fetchPartsMock(request);
    }
    return fetchPartsFromBackend(request);
  },

  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    return generateImageWithGemini(request);
  },
};

/**
 * Convenience function: Get parts and generate image in one call
 */
export async function getPartsAndGenerateImage(
  deviceName: string,
  deviceId?: string
): Promise<GenerateImageResponse> {
  // First, get the parts
  const partsData = await imageGenerationApi.getParts({
    deviceName,
    deviceId,
  });

  // Then, generate the image
  return imageGenerationApi.generateImage({
    deviceName: partsData.deviceName,
    parts: partsData.parts,
  });
}

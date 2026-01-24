/**
 * Image Generation API Contracts
 * 
 * Defines the interfaces for image generation using Gemini API
 */

export interface PartsRequest {
  deviceName: string;
  deviceId?: string;
}

export interface PartsResponse {
  deviceName: string;
  parts: string[];
}

export interface GenerateImageRequest {
  deviceName: string;
  parts: string[];
}

export interface GenerateImageResponse {
  imageUrl: string;
  imageData?: string; // Base64 encoded image data
}

/**
 * API Client Interface for Image Generation
 */
export interface IImageGenerationAPI {
  /**
   * Fetches parts list from webscraping backend
   */
  getParts(request: PartsRequest): Promise<PartsResponse>;

  /**
   * Generates an image using Gemini API based on device name and parts
   */
  generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse>;
}

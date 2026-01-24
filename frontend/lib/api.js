/**
 * API Client for Backend Communication
 * 
 * Handles all API calls to the Flask backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Get parts list for a device
 * @param {string} deviceName - Name of the device
 * @param {string} [deviceId] - Optional device ID
 * @returns {Promise<{deviceName: string, parts: string[]}>}
 */
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch parts: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate an image using Gemini API
 * @param {string} deviceName - Name of the device
 * @param {string[]} parts - List of parts
 * @returns {Promise<{imageUrl: string, imageData?: string}>}
 */
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate image: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get parts and generate image in one call
 * @param {string} deviceName - Name of the device
 * @param {string} [deviceId] - Optional device ID
 * @returns {Promise<{imageUrl: string, imageData?: string}>}
 */
export async function getPartsAndGenerateImage(deviceName, deviceId) {
  // First get parts
  const partsData = await getParts(deviceName, deviceId);
  
  // Then generate image
  return generateImage(partsData.deviceName, partsData.parts);
}

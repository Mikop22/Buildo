/**
 * API Client for Backend Communication
 * 
 * Handles all API calls to the Flask backends
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const ASSEMBLY_IMAGES_URL = process.env.NEXT_PUBLIC_ASSEMBLY_IMAGES_URL || 'http://localhost:5001';

/**
 * Generate project parts and assembly steps from a description
 * @param {string} description - Project description
 * @returns {Promise<object>} - Parts, assembly steps, and assembled product image
 */
export async function generateProject(description) {
  // Add timestamp to prevent any caching
  const res = await fetch(`${BACKEND_URL}/generate?t=${Date.now()}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    body: JSON.stringify({ description }),
    cache: 'no-store'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate project');
  }
  return res.json();
}

/**
 * Generate step-by-step assembly images
 * @param {object} payload - Assembly images request payload
 * @returns {Promise<{project_id: string, images: Array<{step: number, image_b64: string}>}>}
 */
export async function generateAssemblyImages(payload) {
  const res = await fetch(`${ASSEMBLY_IMAGES_URL}/v1/assembly-images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate step images');
  }
  return res.json();
}

/**
 * Generate a single assembly step image (for progressive loading)
 * @param {object} payload - Single step image request payload
 * @param {function} onProgress - Callback called when image is generated: (stepImage) => void
 * @returns {Promise<{step: number, image_b64: string}>}
 */
export async function generateSingleStepImage(payload) {
  const res = await fetch(`${ASSEMBLY_IMAGES_URL}/v1/assembly-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate step image');
  }
  return res.json();
}

/**
 * Convert a remote image URL to base64 via backend proxy (to avoid CORS)
 * @param {string} url - Remote image URL
 * @returns {Promise<{data: string, mimeType: string}>} - Base64 data and MIME type
 */
export async function fetchImageAsBase64(url) {
  const proxyUrl = `${BACKEND_URL}/proxy-image?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) {
    throw new Error('Failed to fetch image via proxy');
  }
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return {
    data: btoa(binary),
    mimeType: blob.type || 'image/png'
  };
}

/**
 * Extract all parts with image URLs from the generate response
 * @param {object} data - Response from /generate
 * @returns {Array<{name: string, image_url: string, category: string, subcategory: string}>}
 */
export function extractPartsWithImages(data) {
  const parts = [];
  const skipKeys = ['assembly_steps', 'assembled_product_image', 'firmware'];
  
  for (const [category, subcategories] of Object.entries(data)) {
    if (skipKeys.includes(category)) continue;
    if (!subcategories || typeof subcategories !== 'object') continue;
    
    for (const [subcategory, partsList] of Object.entries(subcategories)) {
      if (!Array.isArray(partsList)) continue;
      for (const part of partsList) {
        if (part.image_url) {
          parts.push({
            name: part.name || part.title || 'Unknown Part',
            image_url: part.image_url,
            category,
            subcategory
          });
        }
      }
    }
  }
  return parts;
}

/**
 * Extract module names from parts data for the assembly scene
 * @param {object} data - Response from /generate
 * @returns {string[]} - List of module names
 */
export function extractModuleNames(data) {
  const modules = [];
  const skipKeys = ['assembly_steps', 'assembled_product_image', 'firmware'];
  
  for (const [category, subcategories] of Object.entries(data)) {
    if (skipKeys.includes(category)) continue;
    if (!subcategories || typeof subcategories !== 'object') continue;
    
    for (const [subcategory, partsList] of Object.entries(subcategories)) {
      if (!Array.isArray(partsList)) continue;
      for (const part of partsList) {
        const name = part.name || part.title;
        if (name) {
          modules.push(name);
        }
      }
    }
  }
  return modules;
}

/**
 * Build reference images payload for assembly-images-service
 * @param {object} data - Response from /generate
 * @returns {Promise<Array<{label: string, description: string, image_b64: string, mime_type: string}>>}
 */
export async function buildReferenceImages(data) {
  const parts = extractPartsWithImages(data);
  const referenceImages = [];
  
  // Limit to first 5 parts to avoid overwhelming the API
  const partsToProcess = parts.slice(0, 5);
  
  for (const part of partsToProcess) {
    try {
      const { data: imageData, mimeType } = await fetchImageAsBase64(part.image_url);
      referenceImages.push({
        label: part.name,
        description: `${part.category} - ${part.subcategory}`,
        image_b64: imageData,
        mime_type: mimeType
      });
    } catch (err) {
      console.warn(`Failed to fetch image for ${part.name}:`, err.message);
      // Continue with other images
    }
  }
  
  return referenceImages;
}

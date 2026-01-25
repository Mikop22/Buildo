/**
 * Mock Backend Implementation
 * 
 * Simulates Meshy backend behavior for development and demo purposes.
 * Set USE_MOCK = false to switch to real backend when ready.
 */

import type {
  Generate3DRequest,
  Generate3DResponse,
  JobStatusResponse,
  I3DGenerationAPI,
} from "./api";

// Set to false to use real Meshy API (requires VITE_MESHY_API_KEY in .env.local)
// You can also toggle this via the UI - see App.tsx
export const USE_MOCK = true; // Default to mock for demo

// Using stable public GLB files for demo purposes
// These are sample models from Khronos glTF Sample Models repository
const DEMO_MODELS = [
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb",
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SciFiHelmet/glTF-Binary/SciFiHelmet.glb",
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Sponza/glTF-Binary/Sponza.glb",
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb",
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb",
];

// Pick a random model for variety, or use the first one
const DEMO_GLB_URL = DEMO_MODELS[0]; // Change index to use different models

// In-memory job store (simulates backend database)
const jobStore = new Map<string, {
  request: Generate3DRequest;
  createdAt: number;
  completed: boolean;
}>();

/**
 * Mock API Implementation
 * 
 * Simulates async job processing:
 * - generate3D: Returns immediately with jobId
 * - get3DStatus: Returns RUNNING for 2-4 seconds, then SUCCEEDED
 */
export const mockApi: I3DGenerationAPI = {
  async generate3D(request: Generate3DRequest): Promise<Generate3DResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    jobStore.set(jobId, {
      request,
      createdAt: Date.now(),
      completed: false,
    });

    return {
      jobId,
      status: "RUNNING",
    };
  },

  async get3DStatus(jobId: string): Promise<JobStatusResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const job = jobStore.get(jobId);
    
    if (!job) {
      return {
        status: "FAILED",
        error: "Job not found",
      };
    }

    const elapsed = Date.now() - job.createdAt;
    const completionTime = 2000 + Math.random() * 2000; // 2-4 seconds

    if (elapsed < completionTime) {
      return {
        status: "RUNNING",
      };
    }

    if (!job.completed) {
      job.completed = true;
    }

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        status: "FAILED",
        error: "Generation failed: Model processing error",
      };
    }

    // Pick a random demo model for variety
    const randomModel = DEMO_MODELS[Math.floor(Math.random() * DEMO_MODELS.length)];

    return {
      status: "SUCCEEDED",
      modelUrl: randomModel,
    };
  },
};

/**
 * Real API Implementation
 * 
 * Connects to the actual Meshy API.
 * Requires VITE_MESHY_API_KEY to be set in environment variables.
 */

// Get API key from environment variables
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_MESHY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_MESHY_API_KEY is not set. Please add it to your .env.local file."
    );
  }
  return apiKey;
};

// Meshy API base URL (adjust if different)
const MESHY_API_BASE = "https://api.meshy.ai/v2";

export const realApi: I3DGenerationAPI = {
  async generate3D(request: Generate3DRequest): Promise<Generate3DResponse> {
    const apiKey = getApiKey();

    // Meshy API endpoint for 3D generation
    // Adjust the endpoint path based on Meshy's actual API documentation
    const response = await fetch(`${MESHY_API_BASE}/text-to-3d`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Map our request format to Meshy's expected format
        // Adjust these fields based on Meshy's actual API requirements
        prompt: request.productName,
        product_id: request.productId,
        images: request.images,
        dimensions: request.dimensions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.statusText} (${response.status})`
      );
    }

    const data = await response.json();
    
    // Map Meshy's response to our expected format
    return {
      jobId: data.job_id || data.id || data.task_id,
      status: "RUNNING",
    };
  },

  async get3DStatus(jobId: string): Promise<JobStatusResponse> {
    const apiKey = getApiKey();

    // Meshy API endpoint for job status
    // Adjust the endpoint path based on Meshy's actual API documentation
    const response = await fetch(`${MESHY_API_BASE}/text-to-3d/${jobId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.statusText} (${response.status})`
      );
    }

    const data = await response.json();

    // Map Meshy's status to our expected format
    // Adjust these mappings based on Meshy's actual status values
    const status = data.status?.toUpperCase();
    
    if (status === "COMPLETED" || status === "SUCCEEDED" || status === "SUCCESS") {
      return {
        status: "SUCCEEDED",
        modelUrl: data.model_url || data.result_url || data.glb_url,
      };
    } else if (status === "FAILED" || status === "ERROR") {
      return {
        status: "FAILED",
        error: data.error || data.message || "Generation failed",
      };
    } else {
      return {
        status: "RUNNING",
      };
    }
  },
};

/**
 * Runtime API mode toggle
 * Allows switching between mock and real API without code changes
 */
let currentUseMock = USE_MOCK;

export function setUseMock(value: boolean) {
  currentUseMock = value;
}

export function getUseMock(): boolean {
  return currentUseMock;
}

/**
 * Export the active API based on USE_MOCK flag or runtime toggle
 */
export const api: I3DGenerationAPI = {
  generate3D: (request: Generate3DRequest) => {
    return currentUseMock ? mockApi.generate3D(request) : realApi.generate3D(request);
  },
  get3DStatus: (jobId: string) => {
    return currentUseMock ? mockApi.get3DStatus(jobId) : realApi.get3DStatus(jobId);
  },
};

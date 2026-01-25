/**
 * Parts API Client
 * 
 * Fetches device parts from the webscraping backend
 */

import { getBackendUrl } from "./config";
import type { PartsRequest, PartsResponse } from "./api";

/**
 * Fetches parts list from the webscraping backend
 */
export async function fetchPartsFromBackend(
  request: PartsRequest
): Promise<PartsResponse> {
  const backendUrl = getBackendUrl();

  try {
    // Call the webscraping backend endpoint
    // Adjust the endpoint path based on your actual backend API
    const response = await fetch(`${backendUrl}/api/parts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceName: request.deviceName,
        deviceId: request.deviceId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Backend error: ${response.statusText} (${response.status})`
      );
    }

    const data = await response.json();

    // Map backend response to our format
    return {
      deviceName: data.deviceName || request.deviceName,
      parts: data.parts || data.partsList || [],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch parts from backend");
  }
}

/**
 * Mock implementation for development/testing
 * 
 * This is just for testing - in production, parts come from the webscraping backend.
 * The deviceName is passed through as-is from the request.
 */
export async function fetchPartsMock(
  request: PartsRequest
): Promise<PartsResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock parts based on device name
  // In real usage, the backend would return the actual parts for the device
  const mockParts: Record<string, string[]> = {
    "plant": [
      "LED grow light",
      "Water pump",
      "Soil moisture sensor",
      "Battery pack",
      "Microcontroller",
      "Plant container",
    ],
    "robot": [
      "Motor",
      "Battery",
      "Chassis",
      "Sensors",
      "Microcontroller",
      "Wheels",
    ],
  };

  const deviceLower = request.deviceName.toLowerCase();
  const parts = mockParts[deviceLower] || [
    "Component 1",
    "Component 2",
    "Component 3",
  ];

  // Return the device name as-is from the request (comes from backend/webscraper)
  return {
    deviceName: request.deviceName,
    parts,
  };
}

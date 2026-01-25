/**
 * Final API Contracts for 3D Generation
 * 
 * These contracts represent the future Meshy backend integration.
 * DO NOT modify these contracts - they must remain stable for backend wiring.
 */

export interface Generate3DRequest {
  productId: string;
  productName: string;
  images?: string[];
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
}

export interface Generate3DResponse {
  jobId: string;
  status: "RUNNING";
}

export type JobStatus = "RUNNING" | "SUCCEEDED" | "FAILED";

export interface JobStatusResponse {
  status: JobStatus;
  modelUrl?: string;
  error?: string;
}

/**
 * API Client Interface
 * 
 * This interface defines the contract that both mock and real implementations must follow.
 */
export interface I3DGenerationAPI {
  /**
   * Initiates a 3D generation job
   */
  generate3D(request: Generate3DRequest): Promise<Generate3DResponse>;

  /**
   * Polls the status of a 3D generation job
   */
  get3DStatus(jobId: string): Promise<JobStatusResponse>;
}

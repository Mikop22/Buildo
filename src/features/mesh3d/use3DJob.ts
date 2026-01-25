/**
 * use3DJob Hook
 * 
 * Manages 3D generation job lifecycle:
 * - Starts generation
 * - Polls job status
 * - Exposes status, modelUrl, error, and retry function
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { Generate3DRequest, JobStatus } from "./api";
import { api } from "./mockApi";

export interface Use3DJobState {
  status: JobStatus | "IDLE";
  modelUrl: string | null;
  error: string | null;
  isGenerating: boolean;
  isPolling: boolean;
}

export interface Use3DJobReturn extends Use3DJobState {
  generate: (request: Generate3DRequest) => Promise<void>;
  retry: () => void;
  reset: () => void;
}

const POLL_INTERVAL_MS = 3000; // Poll every 3 seconds

export function use3DJob(): Use3DJobReturn {
  const [state, setState] = useState<Use3DJobState>({
    status: "IDLE",
    modelUrl: null,
    error: null,
    isGenerating: false,
    isPolling: false,
  });

  const jobIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const abortRef = useRef<boolean>(false);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      abortRef.current = true;
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isPolling: false }));
  }, []);

  const startPolling = useCallback((jobId: string) => {
    abortRef.current = false;
    setState((prev) => ({ ...prev, isPolling: true }));

    const poll = async () => {
      if (abortRef.current) {
        stopPolling();
        return;
      }

      try {
        const statusResponse = await api.get3DStatus(jobId);

        if (abortRef.current) {
          return;
        }

        if (statusResponse.status === "SUCCEEDED") {
          stopPolling();
          setState({
            status: "SUCCEEDED",
            modelUrl: statusResponse.modelUrl || null,
            error: null,
            isGenerating: false,
            isPolling: false,
          });
        } else if (statusResponse.status === "FAILED") {
          stopPolling();
          setState({
            status: "FAILED",
            modelUrl: null,
            error: statusResponse.error || "Generation failed",
            isGenerating: false,
            isPolling: false,
          });
        } else {
          // Still running, continue polling
          setState((prev) => ({
            ...prev,
            status: "RUNNING",
          }));
        }
      } catch (error) {
        if (abortRef.current) {
          return;
        }

        stopPolling();
        setState({
          status: "FAILED",
          modelUrl: null,
          error: error instanceof Error ? error.message : "Unknown error occurred",
          isGenerating: false,
          isPolling: false,
        });
      }
    };

    // Poll immediately, then set interval
    poll();
    pollIntervalRef.current = window.setInterval(poll, POLL_INTERVAL_MS);
  }, [stopPolling]);

  const generate = useCallback(async (request: Generate3DRequest) => {
    // Reset state
    abortRef.current = false;
    setState({
      status: "IDLE",
      modelUrl: null,
      error: null,
      isGenerating: true,
      isPolling: false,
    });

    try {
      const response = await api.generate3D(request);
      jobIdRef.current = response.jobId;

      setState((prev) => ({
        ...prev,
        status: "RUNNING",
      }));

      // Start polling
      startPolling(response.jobId);
    } catch (error) {
      setState({
        status: "FAILED",
        modelUrl: null,
        error: error instanceof Error ? error.message : "Failed to start generation",
        isGenerating: false,
        isPolling: false,
      });
    }
  }, [startPolling]);

  const retry = useCallback(() => {
    // If we have a jobId, retry polling
    if (jobIdRef.current) {
      startPolling(jobIdRef.current);
    } else {
      // Otherwise, reset to allow new generation
      reset();
    }
  }, [startPolling]);

  const reset = useCallback(() => {
    abortRef.current = true;
    stopPolling();
    jobIdRef.current = null;
    setState({
      status: "IDLE",
      modelUrl: null,
      error: null,
      isGenerating: false,
      isPolling: false,
    });
  }, [stopPolling]);

  return {
    ...state,
    generate,
    retry,
    reset,
  };
}

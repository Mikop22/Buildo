/**
 * ModelPanel Component
 * 
 * Demo entry point for 3D generation flow.
 * UI States:
 * 1) Initial: "Generate 3D" button
 * 2) Loading: Friendly loading messages
 * 3) Error: Error message with Retry button
 * 4) Success: Renders ModelViewer
 */

import { useState } from "react";
import { use3DJob } from "./use3DJob";
import { ModelViewer } from "./ModelViewer";
import type { Generate3DRequest } from "./api";

export interface ModelPanelProps {
  productId?: string;
  productName?: string;
  images?: string[];
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  className?: string;
}

export function ModelPanel({
  productId = "demo-product-001",
  productName = "Demo Product",
  images,
  dimensions,
  className,
}: ModelPanelProps) {
  const { status, modelUrl, error, isGenerating, isPolling, generate, retry, reset } = use3DJob();
  const [hasStarted, setHasStarted] = useState(false);

  const handleGenerate = async () => {
    setHasStarted(true);
    const request: Generate3DRequest = {
      productId,
      productName,
      images,
      dimensions,
    };
    await generate(request);
  };

  const handleRetry = () => {
    retry();
  };

  const handleReset = () => {
    reset();
    setHasStarted(false);
  };

  // Success state: Show viewer
  if (status === "SUCCEEDED" && modelUrl) {
    return (
      <div className={className} style={{ width: "100%", height: "600px", position: "relative" }}>
        <div style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 10,
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: "8px 16px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ← Generate New
          </button>
        </div>
        <ModelViewer modelUrl={modelUrl} dimensions={dimensions} />
      </div>
    );
  }

  // Error state
  if (status === "FAILED") {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#333" }}>
          Generation Failed
        </h3>
        <p style={{ margin: "0 0 24px 0", color: "#666", textAlign: "center", maxWidth: "400px" }}>
          {error || "An error occurred while generating the 3D model."}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleRetry}
            style={{
              padding: "12px 24px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            🔄 Retry
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: "12px 24px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isGenerating || isPolling || status === "RUNNING") {
    const loadingMessages = [
      "Initializing 3D generation...",
      "Processing product images...",
      "Generating 3D mesh...",
      "Optimizing model geometry...",
      "Almost done...",
    ];
    
    // Cycle through messages based on time
    const messageIndex = Math.min(
      Math.floor((Date.now() % 10000) / 2000),
      loadingMessages.length - 1
    );

    return (
      <div
        className={className}
        style={{
          width: "100%",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              border: "4px solid #e0e0e0",
              borderTop: "4px solid #2196F3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#333" }}>
          Generating 3D Model
        </h3>
        <p style={{ margin: "0", color: "#666", textAlign: "center" }}>
          {loadingMessages[messageIndex]}
        </p>
        <p style={{ margin: "16px 0 0 0", color: "#999", fontSize: "12px" }}>
          This usually takes 2-4 seconds...
        </p>
      </div>
    );
  }

  // Initial state: Generate button
  return (
    <div
      className={className}
      style={{
        width: "100%",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎨</div>
      <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#333" }}>
        Generate 3D Model
      </h2>
      <p style={{ margin: "0 0 32px 0", color: "#666", textAlign: "center", maxWidth: "400px" }}>
        Transform your product into an interactive 3D model. Click below to start generation.
      </p>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{
          padding: "16px 32px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: isGenerating ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
          transition: "all 0.2s",
          opacity: isGenerating ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isGenerating) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(33, 150, 243, 0.3)";
        }}
      >
        {isGenerating ? "Generating..." : "✨ Generate 3D"}
      </button>
    </div>
  );
}

/**
 * Image Panel Component
 * 
 * Complete UI for 2D image generation workflow
 */

import { useState } from "react";
import { getPartsAndGenerateImage } from "./imageGenerationApi";
import { ImageViewer } from "./ImageViewer";

interface ImagePanelProps {
  deviceName: string;
  deviceId?: string;
}

export function ImagePanel({ deviceName, deviceId }: ImagePanelProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const loadingMessages = [
    "Fetching device parts...",
    "Generating image with Gemini...",
    "Almost done...",
  ];

  const handleGenerate = async () => {
    setStatus("loading");
    setError(null);
    setImageUrl(null);
    let messageIndex = 0;

    // Update loading message periodically
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 1500);

    try {
      const result = await getPartsAndGenerateImage(deviceName, deviceId);
      setImageUrl(result.imageUrl);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
      setStatus("error");
    } finally {
      clearInterval(messageInterval);
      setLoadingMessage("");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setImageUrl(null);
    setError(null);
  };

  if (status === "idle") {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "48px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: "12px",
          fontSize: "24px",
          color: "#333",
        }}>
          Generate 2D Image
        </h2>
        <p style={{
          margin: "0 0 32px 0",
          color: "#666",
          fontSize: "16px",
        }}>
          Generate a 2D image of <strong>{deviceName}</strong> using AI
        </p>
        <button
          onClick={handleGenerate}
          style={{
            padding: "16px 32px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
          }}
        >
          ✨ Generate 2D Image
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "48px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block",
          width: "48px",
          height: "48px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #4CAF50",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "24px",
        }} />
        <h3 style={{
          margin: "0 0 8px 0",
          fontSize: "20px",
          color: "#333",
        }}>
          Generating Image...
        </h3>
        <p style={{
          margin: 0,
          color: "#666",
          fontSize: "14px",
        }}>
          {loadingMessage || "Please wait"}
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <div style={{
          padding: "16px",
          backgroundColor: "#ffebee",
          borderRadius: "8px",
          border: "1px solid #f44336",
          marginBottom: "16px",
        }}>
          <h3 style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            color: "#c62828",
          }}>
            ❌ Generation Failed
          </h3>
          <p style={{
            margin: 0,
            color: "#d32f2f",
            fontSize: "14px",
          }}>
            {error}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleGenerate}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
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
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ← Start Over
          </button>
        </div>
      </div>
    );
  }

  if (status === "success" && imageUrl) {
    return (
      <ImageViewer
        imageUrl={imageUrl}
        deviceName={deviceName}
        onReset={handleReset}
      />
    );
  }

  return null;
}

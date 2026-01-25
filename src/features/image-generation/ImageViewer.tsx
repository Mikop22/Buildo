/**
 * 2D Image Viewer Component
 * 
 * Displays generated images from Gemini
 */

interface ImageViewerProps {
  imageUrl: string;
  deviceName?: string;
  onReset?: () => void;
}

export function ImageViewer({ imageUrl, deviceName, onReset }: ImageViewerProps) {
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      {onReset && (
        <div style={{ marginBottom: "16px" }}>
          <button
            onClick={onReset}
            style={{
              padding: "8px 16px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Generate New
          </button>
        </div>
      )}

      {deviceName && (
        <h2 style={{
          marginTop: 0,
          marginBottom: "16px",
          fontSize: "20px",
          color: "#333",
        }}>
          {deviceName}
        </h2>
      )}

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        padding: "24px",
        border: "2px dashed #ddd",
      }}>
        <img
          src={imageUrl}
          alt={deviceName || "Generated image"}
          style={{
            maxWidth: "100%",
            maxHeight: "600px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />
      </div>

      <div style={{
        marginTop: "16px",
        padding: "12px",
        backgroundColor: "#e8f5e9",
        borderRadius: "6px",
        fontSize: "14px",
        color: "#2e7d32",
      }}>
        <strong>✅ 2D Image Generated Successfully</strong>
        <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>
          This image was generated using Google Gemini based on the device parts.
        </p>
      </div>
    </div>
  );
}

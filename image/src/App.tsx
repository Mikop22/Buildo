import { useState, useEffect } from "react";
import { ModelPanel, setUseMock, getUseMock } from "./features/mesh3d";
import { ImagePanel } from "./features/image-generation";

type GenerationMode = "2d" | "3d";

function App() {
  // State for generation mode (2D or 3D)
  const [generationMode, setGenerationMode] = useState<GenerationMode>("3d");
  
  // State for manual image input
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [productName, setProductName] = useState("Demo Product");
  const [productId, setProductId] = useState("demo-product-001");
  const [width, setWidth] = useState("10");
  const [height, setHeight] = useState("5");
  const [depth, setDepth] = useState("3");
  const [showInputs, setShowInputs] = useState(true);
  const [useMockMode, setUseMockMode] = useState(getUseMock());

  const handleAddImageField = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const handleImageChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls.length > 0 ? newUrls : [""]);
  };

  const handleStartGeneration = () => {
    setShowInputs(false);
  };

  const handleReset = () => {
    setShowInputs(true);
  };

  const handleToggleApiMode = () => {
    const newMode = !useMockMode;
    setUseMockMode(newMode);
    setUseMock(newMode);
    // Reset to show the change
    setShowInputs(true);
  };

  // Filter out empty image URLs
  const validImageUrls = imageUrls.filter(url => url.trim() !== "");

  return (
    <div style={{
      minHeight: "100vh",
      padding: "24px",
      backgroundColor: "#fafafa",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <header style={{
          marginBottom: "32px",
          textAlign: "center",
        }}>
          <h1 style={{
            margin: "0 0 8px 0",
            fontSize: "32px",
            color: "#333",
          }}>
            AI Product Generation
          </h1>
          <p style={{
            margin: "0",
            color: "#666",
            fontSize: "16px",
          }}>
            Generate 2D images or 3D models using AI
          </p>
          
          {/* Generation Mode Toggle */}
          <div style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
          }}>
            <span style={{ fontSize: "14px", color: "#666" }}>Generation Mode:</span>
            <div style={{
              display: "flex",
              backgroundColor: "#f0f0f0",
              borderRadius: "20px",
              padding: "4px",
              gap: "4px",
            }}>
              <button
                onClick={() => {
                  setGenerationMode("2d");
                  setShowInputs(true);
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: generationMode === "2d" ? "#4CAF50" : "transparent",
                  color: generationMode === "2d" ? "white" : "#666",
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              >
                🖼️ 2D Image
              </button>
              <button
                onClick={() => {
                  setGenerationMode("3d");
                  setShowInputs(true);
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: generationMode === "3d" ? "#2196F3" : "transparent",
                  color: generationMode === "3d" ? "white" : "#666",
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              >
                🎨 3D Model
              </button>
            </div>
          </div>

          {/* API Mode Toggle */}
          <div style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
          }}>
            <span style={{ fontSize: "14px", color: "#666" }}>API Mode:</span>
            <button
              onClick={handleToggleApiMode}
              style={{
                padding: "8px 16px",
                backgroundColor: useMockMode ? "#4CAF50" : "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{useMockMode ? "🎭 Demo Mode" : "🔌 Real API"}</span>
            </button>
            {useMockMode ? (
              <span style={{ fontSize: "12px", color: "#4CAF50" }}>
                (Using demo duck model)
              </span>
            ) : (
              <span style={{ fontSize: "12px", color: "#2196F3" }}>
                (Using Meshy API)
              </span>
            )}
          </div>
        </header>

        {showInputs ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "24px",
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px" }}>
              Product Information
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Product ID:
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                placeholder="product-123"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Product Name:
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                placeholder="My Product"
              />
            </div>

            {generationMode === "3d" && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ fontWeight: "500" }}>
                  Product Images (URLs):
                </label>
                <button
                  onClick={handleAddImageField}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  + Add Image
                </button>
              </div>
              {imageUrls.map((url, index) => (
                <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                    placeholder="https://example.com/product-image.jpg"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#666" }}>
                {validImageUrls.length > 0 
                  ? `${validImageUrls.length} image(s) added` 
                  : "No images added (optional)"}
              </p>
            </div>
            )}

            {generationMode === "3d" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Width (cm):
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  placeholder="10"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Height (cm):
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  placeholder="5"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Depth (cm):
                </label>
                <input
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  placeholder="3"
                />
              </div>
            </div>
            )}

            <button
              onClick={handleStartGeneration}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: generationMode === "2d" ? "#4CAF50" : "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {generationMode === "2d" ? "Start 2D Image Generation" : "Start 3D Generation"}
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
            {generationMode === "2d" ? (
              <ImagePanel
                deviceName={productName}
                deviceId={productId}
              />
            ) : (
              <>
                <div style={{ marginBottom: "16px" }}>
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
                    }}
                  >
                    ← Edit Settings
                  </button>
                </div>
                <ModelPanel
                  productId={productId}
                  productName={productName}
                  images={validImageUrls.length > 0 ? validImageUrls : undefined}
                  dimensions={{
                    width: width ? parseFloat(width) : undefined,
                    height: height ? parseFloat(height) : undefined,
                    depth: depth ? parseFloat(depth) : undefined,
                  }}
                />
              </>
            )}
          </div>
        )}

        <div style={{
          marginTop: "32px",
          padding: "16px",
          backgroundColor: useMockMode ? "#fff3cd" : "#e3f2fd",
          borderRadius: "8px",
          fontSize: "14px",
          color: useMockMode ? "#856404" : "#1976d2",
          border: `1px solid ${useMockMode ? "#ffc107" : "#2196F3"}`,
        }}>
          {generationMode === "2d" ? (
            <>
              <strong>🖼️ 2D Image Generation Mode:</strong> Generating images using Google Gemini API.
              {useMockMode ? (
                <div style={{ marginTop: "8px" }}>
                  <strong>Demo Mode:</strong> Using mock image generation. Set <code>USE_MOCK_IMAGE = false</code> to use real Gemini API.
                </div>
              ) : (
                <div style={{ marginTop: "8px" }}>
                  <strong>Real API:</strong> Using Gemini API with your API key from <code>.env.local</code>.
                </div>
              )}
            </>
          ) : useMockMode ? (
            <>
              <strong>🎭 Demo Mode Active:</strong> Using mock backend with demo duck model. 
              Toggle to "Real API" above to use your Meshy API key.
              {validImageUrls.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <strong>Note:</strong> Images you entered won't be used in demo mode.
                </div>
              )}
            </>
          ) : (
            <>
              <strong>🔌 Real API Mode Active:</strong> Using Meshy API with your API key from <code>.env.local</code>.
              {validImageUrls.length > 0 ? (
                <div style={{ marginTop: "8px" }}>
                  <strong>Images to use:</strong> {validImageUrls.length} image(s) will be sent to Meshy API.
                </div>
              ) : (
                <div style={{ marginTop: "8px" }}>
                  <strong>Note:</strong> No images provided. Meshy will generate from product name only.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

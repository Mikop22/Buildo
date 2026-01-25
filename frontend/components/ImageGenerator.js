'use client';

import { useState } from 'react';
import { generateProject } from '../lib/api';
import styles from './ImageGenerator.module.css';

export default function ImageGenerator() {
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const loadingMessages = [
    'Fetching device parts...',
    'Generating image with AI...',
    'Almost done...',
  ];

  const handleGenerate = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);
    let messageIndex = 0;

    // Update loading message periodically
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 1500);

    try {
      const result = await generateProject(deviceName);
      // Use assembled_product_image if available
      if (result.assembled_product_image) {
        setImageUrl(`data:image/png;base64,${result.assembled_product_image}`);
      } else {
        setError('No image was generated');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate image');
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleReset = () => {
    setDeviceName('');
    setImageUrl(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="nes-container is-rounded is-dark with-title">
      <p className="title">GENERATE PRODUCT IMAGE</p>

      {!imageUrl && !loading && (
        <div className={styles.inputGroup}>
          <div className="nes-field">
            <label>Device Name</label>
            <input
              type="text"
              className="nes-input"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., battery-powered plant"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleGenerate();
                }
              }}
            />
          </div>

          <button
            className="nes-btn is-primary"
            onClick={handleGenerate}
            disabled={loading || !deviceName.trim()}
          >
            {loading ? 'GENERATING...' : 'GENERATE IMAGE'}
          </button>
        </div>
      )}

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className="glow-green">{loadingMessage || 'Please wait...'}</p>
        </div>
      )}

      {error && (
        <div className="nes-container is-rounded is-error">
          <p>ERROR: {error}</p>
          <div className={styles.buttonGroup}>
            <button className="nes-btn is-error" onClick={handleReset}>
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {imageUrl && !loading && (
        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper}>
            <img
              src={imageUrl}
              alt={deviceName || 'Generated image'}
              className={styles.generatedImage}
            />
          </div>
          <div className={styles.successMessage}>
            <p className="glow-green">✅ IMAGE GENERATED SUCCESSFULLY</p>
            <p className={styles.subText}>
              Generated using Google Gemini AI based on device parts
            </p>
          </div>
          <div className={styles.buttonGroup}>
            <button className="nes-btn is-success" onClick={handleReset}>
              GENERATE NEW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

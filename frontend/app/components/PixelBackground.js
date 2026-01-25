"use client";

import { useState, useEffect } from "react";
import styles from "./PixelBackground.module.css";

/**
 * PixelBackground Component
 * Creates animated pixel-art style backgrounds using CSS
 * 
 * @param {string} variant - "city" | "space" | "grid" | "mountains"
 * @param {boolean} animated - Enable/disable animations
 */
export default function PixelBackground({ variant = "space", animated = true }) {
    const [elements, setElements] = useState([]);

    useEffect(() => {
        if (variant === "space") {
            // Generate stars
            const stars = Array.from({ length: 60 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() > 0.8 ? 4 : Math.random() > 0.5 ? 3 : 2,
                delay: Math.random() * 4,
                type: "star"
            }));
            setElements(stars);
        } else if (variant === "city") {
            // Generate city buildings
            const buildings = Array.from({ length: 20 }, (_, i) => ({
                id: i,
                x: i * 5,
                height: 20 + Math.random() * 40,
                width: 3 + Math.random() * 3,
                windows: Math.floor(Math.random() * 6) + 2,
                delay: Math.random() * 2,
                type: "building"
            }));
            setElements(buildings);
        } else if (variant === "grid") {
            // Generate floating pixels
            const pixels = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 4 + Math.random() * 8,
                delay: Math.random() * 5,
                type: "pixel"
            }));
            setElements(pixels);
        }
    }, [variant]);

    return (
        <div className={`${styles.container} ${!animated ? styles.noAnimation : ""}`}>
            {/* Base gradient layer */}
            <div className={styles.gradientLayer} />

            {/* Scanlines overlay */}
            <div className={styles.scanlines} />

            {/* Variant-specific elements */}
            {variant === "space" && (
                <>
                    {elements.map((star) => (
                        <div
                            key={star.id}
                            className={styles.star}
                            style={{
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                animationDelay: `${star.delay}s`
                            }}
                        />
                    ))}
                </>
            )}

            {variant === "city" && (
                <div className={styles.cityscape}>
                    {elements.map((building) => (
                        <div
                            key={building.id}
                            className={styles.building}
                            style={{
                                left: `${building.x}%`,
                                height: `${building.height}%`,
                                width: `${building.width}%`,
                            }}
                        >
                            {Array.from({ length: building.windows }, (_, i) => (
                                <div
                                    key={i}
                                    className={styles.window}
                                    style={{
                                        animationDelay: `${building.delay + i * 0.5}s`
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {variant === "grid" && (
                <>
                    <div className={styles.gridPattern} />
                    {elements.map((pixel) => (
                        <div
                            key={pixel.id}
                            className={styles.floatingPixel}
                            style={{
                                left: `${pixel.x}%`,
                                top: `${pixel.y}%`,
                                width: `${pixel.size}px`,
                                height: `${pixel.size}px`,
                                animationDelay: `${pixel.delay}s`
                            }}
                        />
                    ))}
                </>
            )}
        </div>
    );
}

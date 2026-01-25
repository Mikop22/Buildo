"use client";

import { useState, useEffect } from "react";
import styles from "./PixelBackground.module.css";

/**
 * PixelBackground Component
 * Creates animated pixel-art style backgrounds using CSS
 * 
 * @param {string} variant - "city" | "space" | "grid" | "tech"
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
        } else if (variant === "tech") {
            // Generate tech elements: particles, data streams, nodes
            const particles = Array.from({ length: 40 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 2 + Math.random() * 4,
                delay: Math.random() * 6,
                speed: 3 + Math.random() * 4,
                type: "particle"
            }));
            const dataStreams = Array.from({ length: 8 }, (_, i) => ({
                id: i + 100,
                x: 10 + i * 12,
                delay: Math.random() * 3,
                type: "stream"
            }));
            const nodes = Array.from({ length: 12 }, (_, i) => ({
                id: i + 200,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 6 + Math.random() * 6,
                delay: Math.random() * 2,
                type: "node"
            }));
            setElements([...particles, ...dataStreams, ...nodes]);
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

            {variant === "tech" && (
                <>
                    {/* Circuit grid */}
                    <div className={styles.circuitGrid} />

                    {/* Data streams */}
                    {elements.filter(e => e.type === "stream").map((stream) => (
                        <div
                            key={stream.id}
                            className={styles.dataStream}
                            style={{
                                left: `${stream.x}%`,
                                animationDelay: `${stream.delay}s`
                            }}
                        />
                    ))}

                    {/* Glowing nodes */}
                    {elements.filter(e => e.type === "node").map((node) => (
                        <div
                            key={node.id}
                            className={styles.techNode}
                            style={{
                                left: `${node.x}%`,
                                top: `${node.y}%`,
                                width: `${node.size}px`,
                                height: `${node.size}px`,
                                animationDelay: `${node.delay}s`
                            }}
                        />
                    ))}

                    {/* Floating particles */}
                    {elements.filter(e => e.type === "particle").map((particle) => (
                        <div
                            key={particle.id}
                            className={styles.techParticle}
                            style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                animationDelay: `${particle.delay}s`,
                                animationDuration: `${particle.speed}s`
                            }}
                        />
                    ))}
                </>
            )}
        </div>
    );
}

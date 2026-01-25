"use client";

import { useState } from "react";
import styles from "./Inventory.module.css";

// Mock cart items data - based on existing parts structure
const initialCartItems = [
    {
        id: 1,
        title: "Arduino Uno R3",
        description: "Microcontroller board with 14 digital I/O pins, 6 analog inputs",
        imageUrl: null, // Will use placeholder
        price: 24.99,
        quantity: 1,
    },
    {
        id: 2,
        title: "Servo Motor SG90",
        description: "Micro servo motor with 180° rotation, perfect for robotics",
        imageUrl: null,
        price: 5.99,
        quantity: 2,
    },
    {
        id: 3,
        title: "Jumper Wires (M-M)",
        description: "40-piece male-to-male jumper wire set, various lengths",
        imageUrl: null,
        price: 4.99,
        quantity: 1,
    },
    {
        id: 4,
        title: "Breadboard",
        description: "Half-size solderless breadboard, 400 tie points",
        imageUrl: null,
        price: 6.99,
        quantity: 1,
    },
    {
        id: 5,
        title: "LEDs (Red, Green)",
        description: "5mm LED pack, 20 pieces (10 red, 10 green)",
        imageUrl: null,
        price: 3.99,
        quantity: 1,
    },
];

const TAX_RATE = 0.13; // 13% tax

export default function Inventory() {
    const [cartItems, setCartItems] = useState(initialCartItems);

    // Update quantity for a specific item
    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return; // Prevent going below 1
        
        setCartItems(items =>
            items.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Remove item from cart
    const removeItem = (itemId) => {
        setCartItems(items => items.filter(item => item.id !== itemId));
    };

    // Calculate subtotal for a single item
    const getItemSubtotal = (item) => {
        return item.price * item.quantity;
    };

    // Calculate cart subtotal
    const getCartSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
    };

    // Calculate tax
    const getTax = () => {
        return getCartSubtotal() * TAX_RATE;
    };

    // Calculate total
    const getTotal = () => {
        return getCartSubtotal() + getTax();
    };


    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div className={`nes-container is-rounded is-dark ${styles.emptyCart}`}>
                <div className={styles.emptyCartContent}>
                    <i className="nes-icon is-large cart"></i>
                    <p className={styles.emptyCartTitle}>YOUR CART IS EMPTY</p>
                    <p className={styles.emptyCartText}>
                        Add parts to your cart to get started with your project!
                    </p>
                    <button 
                        className="nes-btn is-primary"
                        onClick={() => setCartItems(initialCartItems)}
                    >
                        BROWSE PARTS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cartContainer}>
            {/* Cart Items List */}
            <div className={styles.cartItemsSection}>
                <div className="nes-container is-rounded is-dark">
                    <p className={styles.sectionTitle}>SHOPPING CART ({cartItems.length} {cartItems.length === 1 ? 'ITEM' : 'ITEMS'})</p>
                    
                    <div className={styles.cartItemsList}>
                        {cartItems.map((item, index) => (
                            <div key={item.id}>
                                <CartItemRow
                                    item={item}
                                    onQuantityChange={(newQty) => updateQuantity(item.id, newQty)}
                                    onRemove={() => removeItem(item.id)}
                                    subtotal={getItemSubtotal(item)}
                                />
                                {index < cartItems.length - 1 && <div className={styles.divider} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className={styles.summarySection}>
                <CartSummary
                    subtotal={getCartSubtotal()}
                    tax={getTax()}
                    total={getTotal()}
                />
            </div>
        </div>
    );
}

// Cart Item Row Component
function CartItemRow({ item, onQuantityChange, onRemove, subtotal }) {
    const handleDecrease = () => {
        if (item.quantity > 1) {
            onQuantityChange(item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        onQuantityChange(item.quantity + 1);
    };

    return (
        <div className={styles.cartItemRow}>
            {/* Thumbnail */}
            <div className={styles.itemThumbnail}>
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} />
                ) : (
                    <div className={styles.placeholderImage}>
                        <i className="nes-icon is-medium package"></i>
                    </div>
                )}
            </div>

            {/* Item Info */}
            <div className={styles.itemInfo}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDescription}>{item.description}</p>
                <div className={styles.stockLabel}>
                    <span className="glow-green">✓ IN STOCK</span>
                </div>
            </div>

            {/* Price and Controls */}
            <div className={styles.itemControls}>
                <div className={styles.priceSection}>
                    <div className={styles.price}>${item.price.toFixed(2)}</div>
                    <div className={styles.subtotalLabel}>Subtotal: ${subtotal.toFixed(2)}</div>
                </div>

                <div className={styles.quantitySection}>
                    <label className={styles.quantityLabel}>Qty:</label>
                    <div className={styles.quantityControls}>
                        <button
                            type="button"
                            className={`nes-btn ${styles.quantityBtn}`}
                            onClick={handleDecrease}
                            disabled={item.quantity <= 1}
                        >
                            -
                        </button>
                        <span className={styles.quantityValue}>{item.quantity}</span>
                        <button
                            type="button"
                            className={`nes-btn ${styles.quantityBtn}`}
                            onClick={handleIncrease}
                        >
                            +
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    className={`nes-btn is-error ${styles.deleteBtn}`}
                    onClick={onRemove}
                    title="Remove item"
                >
                    <i className="nes-icon close is-small"></i>
                </button>
            </div>
        </div>
    );
}

// Cart Summary Component
function CartSummary({ subtotal, tax, total }) {
    return (
        <div className={`nes-container is-rounded is-dark ${styles.summaryCard}`}>
            <p className={styles.summaryTitle}>ORDER SUMMARY</p>
            
            <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>Estimated Tax (13%):</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total:</span>
                    <span className="glow-green">${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

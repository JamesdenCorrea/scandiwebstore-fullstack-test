import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { gql, request } from 'graphql-request';
import styles from './CartOverlay.module.css';

const GRAPHQL_ENDPOINT = 'http://localhost:8000/graphql.php';

type Props = {
  onClose: () => void;
  onPlaceOrder: () => void;
};

const isHexColor = (str: string) => /^#([0-9A-F]{3}){1,2}$/i.test(str);

export default function CartOverlay({ onClose, onPlaceOrder }: Props) {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const total = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError(null);

    const mutation = gql`
      mutation CreateOrder($input: OrderInput!) {
        createOrder(input: $input) {
          id
          total
          items {
            productId
            quantity
          }
        }
      }
    `;

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      total: parseFloat(total)
    };

    try {
      await request(GRAPHQL_ENDPOINT, mutation, { input: orderData });
      clearCart();
      setToast('Order placed successfully!');
      onPlaceOrder();
    } catch (error) {
      console.error('Order failed:', error);
      setOrderError('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }

    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={styles.overlayContainer}>
      <div 
        className={styles.overlayBackdrop} 
        onClick={onClose}
        data-testid="cart-overlay-backdrop"
      />

      <div data-testid="cart-overlay" className={`${styles.overlay} ${styles.fadeIn}`}>
        <div className={styles.header}>
          <h2 data-testid="cart-title" className={styles.title}>Your Shopping Cart</h2>
          <button
            data-testid="close-cart-btn"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <svg className={styles.emptyCartIcon} viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <p data-testid="cart-empty" className={styles.emptyMessage}>
              Your cart is empty
            </p>
            <button onClick={onClose} className={styles.continueShoppingBtn}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className={styles.cartList}>
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className={styles.cartItem}>
                  <img
                    src={item.image || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className={styles.productImage}
                  />

                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <h3 data-testid={`cart-item-name-${index}`} className={styles.itemName}>
                        {item.name}
                      </h3>
                      <span data-testid={`cart-item-price-${index}`} className={styles.itemPrice}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {item.selectedAttributes && (
                      <div className={styles.attributes}>
                        {Object.entries(item.selectedAttributes).map(([key, value]) => {
                          const isColor = isHexColor(value);
                          return (
                            <div key={key} className={styles.attribute}>
                              <span className={styles.attributeName}>{key}:</span>
                              <span className={styles.attributeValue}>
                                {isColor ? (
                                  <span 
                                    className={styles.colorSwatch} 
                                    style={{ backgroundColor: value }}
                                    title={value}
                                  />
                                ) : value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className={styles.quantityControls}>
                      <button
                        data-testid={`decrease-quantity-${index}`}
                        onClick={() => updateQuantity(item.id, item.selectedAttributes, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={styles.quantityButton}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span data-testid={`item-quantity-${index}`} className={styles.quantityValue}>
                        {item.quantity}
                      </span>
                      <button
                        data-testid={`increase-quantity-${index}`}
                        onClick={() => updateQuantity(item.id, item.selectedAttributes, item.quantity + 1)}
                        className={styles.quantityButton}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    data-testid={`remove-item-${index}`}
                    onClick={() => removeFromCart(item.id, item.selectedAttributes)}
                    className={styles.removeButton}
                    aria-label="Remove item"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.summary}>
                <div className={styles.total}>
                  <span>Subtotal:</span>
                  <span data-testid="cart-total" className={styles.totalAmount}>
                    ${total}
                  </span>
                </div>
                <p className={styles.taxNote}>Taxes and shipping calculated at checkout</p>
              </div>

              {orderError && (
                <div data-testid="order-error" className={styles.error}>
                  {orderError}
                </div>
              )}

              <button
                data-testid="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0 || isPlacingOrder}
                className={styles.placeOrderButton}
              >
                {isPlacingOrder ? (
                  <>
                    <svg className={styles.spinner} viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
            </div>
          </>
        )}

        {toast && (
          <div className={styles.toast}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
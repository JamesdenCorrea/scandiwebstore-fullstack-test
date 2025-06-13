import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { gql, request } from 'graphql-request';
import styles from './CartOverlay.module.css';

const GRAPHQL_ENDPOINT = 'http://localhost:8000/graphql.php';

type Props = {
  onClose: () => void;
  onPlaceOrder: () => void;
};

const isHexColor = (str: string): boolean =>
  /^#([0-9A-F]{3}){1,2}$/i.test(str);

const COLOR_NAMES: Record<string, string> = {
  '#000000': 'Black',
  '#030BFF': 'Blue',
  '#03FFF7': 'Cyan',
  '#44FF03': 'Green',
  '#FFFFFF': 'White',
};

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
      if (e.key === 'Escape') onClose();
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
          items { productId quantity }
        }
      }
    `;

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      total: parseFloat(total),
    };

    try {
      await request(GRAPHQL_ENDPOINT, mutation, { input: orderData });
      clearCart();
setToast('Order placed successfully!');
setTimeout(() => {
  onPlaceOrder();
}, 2000); // ✅ Delay navigation so the toast can appear and Playwright can see it

    } catch (error) {
      console.error('Order failed:', error);
      setOrderError('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className={styles.overlayContainer}>
      <div
        className={`${styles.overlayBackdrop} ${!cartItems.length ? styles.hidden : ''}`}
        onClick={onClose}
        data-testid="cart-overlay-backdrop"
      />

      <div data-testid="cart-overlay" className={styles.overlay}>
        <div className={styles.header}>
          <h2 data-testid="cart-title" className={styles.title}>
            Your Shopping Cart
          </h2>
          <button
            data-testid="close-cart-btn"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close cart">
            &times;
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <svg className={styles.emptyCartIcon} viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 ..." />
            </svg>
            <p data-testid="cart-empty" className={styles.emptyMessage}>
              Your cart is empty
            </p>
            <button
              onClick={onClose}
              className={styles.continueShoppingBtn}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className={styles.cartList}>
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className={styles.cartItem}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.productImage}
                    />
                  )}

                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <span className={styles.itemPrice}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {item.selectedAttributes &&
                      Object.entries(item.selectedAttributes).map(([key, value]) => {
                        if (!key || !value) return null;
                        const isColor = isHexColor(value);
                        const displayName = isColor
                          ? COLOR_NAMES[value.toUpperCase()] || value
                          : value;

                        return (
                          <div key={key} className={styles.attribute}>
                            <span className={styles.attributeName}>{key}:</span>
                            <span className={styles.attributeValue}>
                              {isColor ? (
                                <span
                                  className={styles.colorSwatchOnly}
                                  style={{ backgroundColor: value }}
                                />
                              ) : (
                                displayName
                              )}
                            </span>
                          </div>
                        );
                      })}

                    <div className={styles.quantityControls}>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.selectedAttributes,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className={styles.quantityButton}>
                        −
                      </button>
                      <span className={styles.quantityValue}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.selectedAttributes,
                            item.quantity + 1
                          )
                        }
                        className={styles.quantityButton}>
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.id, item.selectedAttributes)
                    }
                    className={styles.removeButton}
                    aria-label="Remove item">
                    &times;
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
                <p className={styles.taxNote}>
                  Taxes and shipping calculated at checkout
                </p>
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
                className={styles.placeOrderButton}>
                {isPlacingOrder ? (
                  <svg className={styles.spinner} viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                  </svg>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
            </div>
          </>
        )}

        {toast && (
          <div
            data-testid="order-success"
            className={styles.toast}
            role="alert"
            aria-live="assertive">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

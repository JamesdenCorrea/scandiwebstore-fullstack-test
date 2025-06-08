// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem } from '../types'; // ✅ Use shared CartItem definition

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, selectedAttributes?: Record<string, string>) => void;
  updateQuantity: (productId: string, selectedAttributes: Record<string, string>, newQuantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = sessionStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const areAttributesEqual = (
    a: Record<string, string>,
    b: Record<string, string>
  ) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(key => a[key] === b[key]);
  };

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        ci =>
          ci.id === item.id &&
          areAttributesEqual(ci.selectedAttributes, item.selectedAttributes)
      );

      if (existingItemIndex !== -1) {
        // Product with same ID and attributes exists → increase quantity by item.quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        return updatedItems;
      }

      // Product does not exist → add new with item.quantity
      return [...prevItems, { ...item }];
    });
  };

  const removeFromCart = (productId: string, selectedAttributes: Record<string, string> = {}) => {
    setCartItems(prevItems =>
      prevItems.filter(
        ci =>
          !(
            ci.id === productId &&
            areAttributesEqual(ci.selectedAttributes, selectedAttributes)
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    selectedAttributes: Record<string, string>,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems =>
      prevItems.map(ci =>
        ci.id === productId && areAttributesEqual(ci.selectedAttributes, selectedAttributes)
          ? { ...ci, quantity: newQuantity }
          : ci
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

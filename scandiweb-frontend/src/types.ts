// File: src/types.ts

export type Attribute = {
  name: string;
  value: string;
  type: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  type: string;
  attributes: Attribute[];
  category: string;
  image: string;
  inStock: boolean;
};

// This is the type you use for the cart, not the full Product
export type CartItem = {
  id: string;
  sku: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedAttributes: Record<string, string>;
  attributes: Attribute[];
  category: string; // Add this line
  inStock: boolean;
};


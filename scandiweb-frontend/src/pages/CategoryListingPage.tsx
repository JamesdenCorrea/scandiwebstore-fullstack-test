// src/pages/CategoryListingPage.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CartOverlay from '../components/CartOverlay';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useCart } from '../context/CartContext';

import './CategoryListingPage.css';

const DESIRED_CATEGORIES = ['All', 'Consoles', 'Computers', 'Phones', 'Accessories'];

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
  image_url: string;
  image: string;
  inStock: boolean;
  description?: string;
};

type RawProduct = {
  id: string;
  sku: string;
  name: string;
  price: number;
  type: string;
  attributes: Attribute[];
  category: string;
  image_url: string;
  in_stock: number;
  description?: string;
};

const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      sku
      name
      price
      type
      attributes {
        name
        value
        type
      }
      category
      image_url
      in_stock
      description
    }
  }
`;

const determineCategory = (productName: string): string => {
  const lowerName = productName.toLowerCase();
  if (/playstation|ps5|ps4|xbox|nintendo|console/.test(lowerName)) return 'Consoles';
  if (/imac|macbook|mac pro|computer|pc|desktop|laptop/.test(lowerName)) return 'Computers';
  if (/iphone|galaxy|pixel|phone|smartphone|mobile/.test(lowerName)) return 'Phones';
  return 'Accessories';
};

export default function CategoryListingPage() {
  const { cartItems, addToCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { category = 'all' } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const selectedCategory = useMemo(() => {
    const capitalized = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    return DESIRED_CATEGORIES.includes(capitalized) ? capitalized : 'All';
  }, [category]);

  const handleCategoryChange = (newCategory: string) => {
    navigate(`/${newCategory.toLowerCase()}`);
  };

  const { loading, error, data } = useQuery(PRODUCTS_QUERY);

  const products: Product[] = useMemo(() => {
    if (!data?.products) return [];
    return data.products.map((p: RawProduct) => {
      const fallbackImage = 'https://via.placeholder.com/300';
      return {
        ...p,
        category: determineCategory(p.name),
        image_url: p.image_url || fallbackImage,
        image: p.image_url || fallbackImage,
        inStock: p.in_stock > 0,
      };
    });
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      setSelectedProduct(product);
      return;
    }

    if (product.attributes.length === 0) {
      addToCart({
        ...product,
        quantity: 1,
        selectedAttributes: {},
      });
    } else {
      setSelectedProduct(product);
    }
  };

  const handleCartClose = () => setShowCart(false);

  const handleOrderPlaced = () => {
    setOrderPlaced(true);
    setShowCart(false);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const handleEscKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showCart) setShowCart(false);
      if (selectedProduct) setSelectedProduct(null);
    }
  }, [showCart, selectedProduct]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [handleEscKey]);

  return (
    <div className="category-listing-page">
      <Header
        onCartClick={() => setShowCart(true)}
        cartItemCount={cartItems.length}
        title="Scandiweb Store"
        categories={DESIRED_CATEGORIES}
        activeCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="page-content">
        {orderPlaced && (
          <div
            data-testid="order-placed-message"
            className="order-placed-message"
            role="alert"
            aria-live="assertive"
          >
            🎉 Order placed successfully!
          </div>
        )}

        {loading && <p data-testid="loading-msg" className="status-message">Loading products...</p>}
        {error && <p data-testid="error-msg" className="status-message error">Error loading products: {error.message}</p>}

        <main data-testid="products-grid" className="products-grid">
          {filteredProducts.length === 0 && !loading && (
            <p className="no-products-msg">No products available in this category.</p>
          )}

          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              onClickImage={() => setSelectedProduct(product)}
            />
          ))}
        </main>

        {showCart && (
          <CartOverlay onClose={handleCartClose} onPlaceOrder={handleOrderPlaced} />
        )}

        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </div>
  );
}

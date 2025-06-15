// scandiweb-frontend/src/pages/CategoryListingPage.tsx
import React, { useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CartOverlay from '../components/CartOverlay';
import { useCart } from '../context/CartContext';
import './CategoryListingPage.css';
import type { Product, CartItem, Attribute } from '../types'; // ✅ Use shared types

const DESIRED_CATEGORIES = ['All', 'Clothes', 'Tech'];

type AttributeItem = {
  id: string;
  displayValue: string;
  value: string;
};

type RawAttribute = {
  id: string;
  name: string;
  type: string;
  items: AttributeItem[];
};

type RawProduct = {
  id: string;
  sku: string;
  name: string;
  price: number;
  type: string;
  category: string;
  brand: string;
  image_url: string;
  in_stock: number;
  description?: string;
  attributes: RawAttribute[];
  gallery: string[];
};

const PRODUCTS_QUERY = gql`
  query FreshProducts {
    products {
      id
      sku
      name
      price
      type
      category
      brand
      image_url
      in_stock
      description
      gallery
      attributes {
        id
        name
        type
        items {
          id
          displayValue
          value
        }
      }
    }
  }
`;

export default function CategoryListingPage() {
  const { cartItems, addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentCategory = pathSegments[0] || 'all';

  const selectedCategory =
    currentCategory === 'all'
      ? 'All'
      : currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);

  const { loading, error, data } = useQuery(PRODUCTS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const products: Product[] = useMemo(() => {
    if (!data?.products) {
      console.log('[GraphQL] No products returned');
      return [];
    }

    return data.products.map((p: RawProduct): Product => {
      const fallbackImage = 'https://via.placeholder.com/300';
      const gallery = p.gallery && p.gallery.length > 0 ? p.gallery : [p.image_url || fallbackImage];
      const uniqueGallery = Array.from(new Set([p.image_url, ...gallery]));

      const parsedAttributes: Attribute[] = (p.attributes || []).map(attr => ({
        name: attr.name,
        type: attr.type,
        value: '', // ✅ Required by shared `Attribute` type
      }));

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        price: p.price,
        type: p.type,
        attributes: parsedAttributes,
        category: p.category,
        image: p.image_url || fallbackImage,
        inStock: p.in_stock > 0,
      };
    });
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;

    const categoryMap: Record<string, string[]> = {
      tech: ['tech', 'phones', 'mobiles', 'electronics', 'gadgets'],
      clothes: ['clothes', 'apparel', 'wearables'],
    };

    const normalizedSelected = selectedCategory.toLowerCase();
    const validCategories = categoryMap[normalizedSelected] || [normalizedSelected];

    return products.filter((p) =>
      validCategories.includes(p.category.toLowerCase())
    );
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      navigate(`/product/${product.id}`);
      return;
    }

    if (product.attributes.length === 0) {
      const cartItem: CartItem = {
        ...product,
        quantity: 1,
        selectedAttributes: {},
      };
      addToCart(cartItem);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleOrderPlaced = () => {
    setOrderPlaced(true);
    setShowCart(false);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  return (
    <div className="category-listing-page">
      <Header
        onCartClick={() => setShowCart((prev) => !prev)}
        cartItemCount={cartItems.length}
        title="Scandiweb Store"
        categories={DESIRED_CATEGORIES}
        activeCategory={selectedCategory}
        onCategoryChange={(category) => navigate(`/${category.toLowerCase()}`)}
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

        {loading && !data?.products && (
          <p data-testid="loading-indicator" className="status-message">
            Loading products...
          </p>
        )}
        {error && (
          <p data-testid="error-message" className="status-message error">
            Error loading products: {error.message}
          </p>
        )}

        <h1 data-testid="category-title" className="category-title">
          {selectedCategory}
        </h1>

        <main
          data-testid="products-grid"
          className="products-grid"
          aria-busy={loading}
        >
          {!loading && !error && filteredProducts.length === 0 && (
            <p data-testid="no-products-message" className="no-products-msg">
              No products available in this category.
            </p>
          )}

          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              data-testid={`product-${product.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9\-]/g, '')}`}
            />
          ))}
        </main>

        {showCart && (
          <CartOverlay
            onClose={() => setShowCart(false)}
            onPlaceOrder={handleOrderPlaced}
          />
        )}
      </div>
    </div>
  );
}

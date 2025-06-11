import React, { useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CartOverlay from '../components/CartOverlay';
import { useCart } from '../context/CartContext';
import './CategoryListingPage.css';

const DESIRED_CATEGORIES = ['All', 'Clothes', 'Tech'];

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
  brand: string;
  image_url: string;
  image: string;
  inStock: boolean;
  description?: string;
  gallery: string[];
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
  attributes: Attribute[];
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
        name
        value
        type
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

  const selectedCategory = currentCategory === 'all'
    ? 'All'
    : currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);

  const { loading, error, data } = useQuery(PRODUCTS_QUERY);

  const products: Product[] = useMemo(() => {
    if (!data?.products) return [];

    return data.products.map((p: RawProduct) => {
      const fallbackImage = 'https://via.placeholder.com/300';
      const gallery = p.gallery && p.gallery.length > 0 ? p.gallery : [p.image_url || fallbackImage];

      // Create unique gallery without duplicates
      const uniqueGallery = Array.from(new Set([p.image_url, ...gallery]));

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        price: p.price,
        type: p.type,
        category: p.category,
        brand: p.brand ?? '',
        image_url: p.image_url || fallbackImage,
        image: p.image_url || fallbackImage,
        inStock: p.in_stock > 0,
        description: p.description,
        attributes: p.attributes || [],
        gallery: uniqueGallery,
      };
    });
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      navigate(`/product/${product.id}`, { state: { background: location } });
      return;
    }

    if (product.attributes.length === 0) {
      addToCart({
        ...product,
        quantity: 1,
        selectedAttributes: {},
        image: product.image_url,
      });
    } else {
      navigate(`/product/${product.id}`, { state: { background: location } });
    }
  };

  const handleImageClick = (product: Product) => {
    navigate(`/product/${product.id}`, { state: { background: location } });
  };

  const handleOrderPlaced = () => {
    setOrderPlaced(true);
    setShowCart(false);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  return (
    <div className="category-listing-page">
      <Header
        onCartClick={() => setShowCart(prev => !prev)}
        cartItemCount={cartItems.length}
        title="Scandiweb Store"
        categories={DESIRED_CATEGORIES}
        activeCategory={selectedCategory}
        onCategoryChange={(category) => console.log('Category changed to:', category)}
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

        {loading && (
          <p data-testid="loading-msg" className="status-message">
            Loading products...
          </p>
        )}
        {error && (
          <p data-testid="error-msg" className="status-message error">
            Error loading products: {error.message}
          </p>
        )}

        <main data-testid="products-grid" className="products-grid">
          {filteredProducts.length === 0 && !loading && (
            <p className="no-products-msg">No products available in this category.</p>
          )}

          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              onClickImage={() => handleImageClick(product)}
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
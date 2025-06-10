import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CartOverlay from '../components/CartOverlay';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useCart } from '../context/CartContext';
import './CategoryListingPage.css';

const DESIRED_CATEGORIES = ['All', 'Tech', 'Consoles', 'Computers', 'Phones', 'Accessories'];

const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id sku name price type attributes { name value type }
      category image_url in_stock description
    }
  }
`;

const determineCategory = (productName: string): string => {
  const name = productName.toLowerCase();
  if (/playstation|ps5|ps4|xbox|nintendo|console/.test(name)) return 'Consoles';
  if (/imac|macbook|mac pro|computer|pc|desktop|laptop/.test(name)) return 'Computers';
  if (/iphone|galaxy|pixel|phone|smartphone|mobile/.test(name)) return 'Phones';
  return 'Accessories';
};

export default function CategoryListingPage() {
  const { cartItems, addToCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { category = 'all' } = useParams();
  const navigate = useNavigate();

  const selectedCategory = useMemo(() => {
    const cap = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    return DESIRED_CATEGORIES.includes(cap) ? cap : 'All';
  }, [category]);

  const handleCategoryChange = (newCategory: string) => {
    navigate(`/${newCategory.toLowerCase()}`);
  };

  const { loading, error, data } = useQuery(PRODUCTS_QUERY);

  const products = useMemo(() => {
    if (!data?.products) return [];
    return data.products.map((p: any) => ({
      ...p,
      category: determineCategory(p.name),
      image_url: p.image_url || 'https://via.placeholder.com/300',
      image: p.image_url || 'https://via.placeholder.com/300',
      inStock: p.in_stock > 0,
    }));
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All' || selectedCategory === 'Tech')
      return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddToCart = (product) => {
    if (!product.inStock) {
      setSelectedProduct(product);
      return;
    }
    if (product.attributes?.length === 0) {
      addToCart({ ...product, quantity: 1, selectedAttributes: {} });
    } else {
      setSelectedProduct(product);
    }
  };

  const closeCart = () => setShowCart(false);
  const onOrderPlaced = () => {
    setOrderPlaced(true);
    closeCart();
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const escHandler = useCallback((e) => {
    if (e.key === 'Escape') {
      if (showCart) closeCart();
      if (selectedProduct) setSelectedProduct(null);
    }
  }, [showCart, selectedProduct]);

  useEffect(() => {
    document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
  }, [escHandler]);

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
          <div data-testid="order-placed-message"
               className="order-placed-message"
               role="alert">🎉 Order placed successfully!</div>
        )}

        {loading && <p data-testid="loading-msg" className="status-message">Loading products...</p>}
        {error && <p data-testid="error-msg" className="status-message error">Error: {error.message}</p>}

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

        {showCart && <CartOverlay onClose={closeCart} onPlaceOrder={onOrderPlaced} />}
        {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CartOverlay from '../components/CartOverlay';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext'; // ✅ Import currency context
import './CategoryListingPage.css';

const DESIRED_CATEGORIES = ['All', 'Clothes', 'Tech'];

const STOCK_OVERRIDES: Record<string, boolean> = {
  'apple-airpods-pro': false,
  'xbox-series-s': false,
  'apple-iphone-12-pro': true
};

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
  const { currency } = useCurrency(); // ✅ Use selected currency
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

  const currencyRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
  };
  const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};


  const products: Product[] = useMemo(() => {
    if (!data?.products) {
      console.log('[GraphQL] No products returned');
      return [];
    }

    const localProductsRaw = localStorage.getItem("addedProducts");
const localProducts: RawProduct[] = localProductsRaw ? JSON.parse(localProductsRaw) : [];

const mergedProducts = [...data.products, ...localProducts];

return mergedProducts.map((p: RawProduct) => {
  const fallbackImage = 'https://via.placeholder.com/300';
  const gallery = p.gallery && p.gallery.length > 0 ? p.gallery : [p.image_url || fallbackImage];
  const uniqueGallery = Array.from(new Set([p.image_url, ...gallery]));

  const stockStatus = STOCK_OVERRIDES[p.id] !== undefined 
    ? STOCK_OVERRIDES[p.id] 
    : p.in_stock > 0;

  const convertedPrice = parseFloat((p.price * currencyRates[currency]).toFixed(2));

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: convertedPrice,
    type: p.type,
    category: p.category,
    brand: p.brand ?? '',
    image_url: p.image_url || fallbackImage,
    image: p.image_url || fallbackImage,
    inStock: stockStatus,
    description: p.description,
    attributes: p.attributes || [],
    gallery: uniqueGallery,
  };
});

  }, [data, currency]);

const filteredProducts = useMemo(() => {
  if (selectedCategory === 'All') return products;

  const categoryMap: Record<string, string[]> = {
    tech: ['tech', 'phones', 'mobiles', 'electronics', 'gadgets'],
    clothes: ['clothes', 'apparel', 'wearables'],
    other: ['other'],
  };

  const normalizedSelected = selectedCategory.toLowerCase();
  const validCategories = categoryMap[normalizedSelected] || [normalizedSelected];

  return products.filter((p) => {
    const productCategory = (p.category || '').toLowerCase();
    return validCategories.includes(productCategory);
  });
}, [products, selectedCategory]);


  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      navigate(`/product/${product.id}`);
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
      navigate(`/product/${product.id}`);
    }
  };

  const handleImageClick = (productId: string) => {
    navigate(`/product/${productId}`);
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
<h1 
  data-testid="product-list-heading" 
  className="product-list-title" 
  role="heading" 
aria-level={1}

>
  Product List
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
  currencySymbol={currencySymbols[currency]} // ✅ Inject currency symbol
  onAddToCart={() => handleAddToCart(product)}
  data-testid={`product-${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`}
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

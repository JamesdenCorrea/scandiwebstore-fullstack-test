// src/pages/ProductDetails.tsx
import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CartOverlay from '../components/CartOverlay';
import { useCart } from '../context/CartContext';
import styles from './ProductDetails.module.css';

type Attribute = {
  name: string;
  value: string;
  type: string;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  type: string;
  attributes: Attribute[];
  category: string;
  image_url: string;
};

const PRODUCTS_QUERY = gql`
  query {
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
    }
  }
`;

const DESIRED_CATEGORIES = ['All', 'Consoles', 'Computers', 'Phones', 'Accessories'];

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const { loading, error, data } = useQuery(PRODUCTS_QUERY);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const product: Product | undefined = data?.products?.find((p: Product) => p.id === id);

  useEffect(() => {
    if (product?.attributes) {
      const initAttrs: Record<string, string> = {};
      product.attributes.forEach((attr: Attribute) => {
        initAttrs[attr.name] = attr.value;
      });
      setSelectedAttributes(initAttrs);
    }
  }, [product]);

  const handleAttributeChange = (name: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      attributes: product.attributes,
      category: product.category,
      image: product.image_url || 'https://via.placeholder.com/150',
      inStock: true,
      quantity,
      selectedAttributes,
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => Math.max(1, q + delta));
  };

  if (loading) return <p data-testid="loading-msg">Loading product details...</p>;
  if (error) return <p data-testid="error-msg">Error loading product: {error.message}</p>;
  if (!product) return <p data-testid="not-found-msg">Product not found.</p>;

  const groupedAttributes = Array.from(
    product.attributes.reduce((map, attr) => {
      if (!map.has(attr.name)) {
        map.set(attr.name, []);
      }
      map.get(attr.name)!.push(attr.value);
      return map;
    }, new Map<string, string[]>())
  );

  return (
    <>
      <Header
        categories={DESIRED_CATEGORIES}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onCartClick={() => setShowCart(true)}
        cartItemCount={cartItems.length}
        title="Product Details"
      />

      {showCart && (
        <CartOverlay
          onClose={() => setShowCart(false)}
          onPlaceOrder={() => setShowCart(false)}
        />
      )}

      <div className={styles.modalContainer} data-testid="product-details">
        <button
          data-testid="back-btn"
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          &larr; Back
        </button>

        <div className={styles.modalContent}>
          <img
            src={product.image_url}
            alt={product.name}
            className={styles.productImage}
          />

          <div className={styles.productInfo}>
            <h1 data-testid="product-name">{product.name}</h1>
            <p data-testid="product-price" className={styles.price}>
              ${product.price.toFixed(2)}
            </p>

            {groupedAttributes.length > 0 && (
              <div>
                <h3>Select Attributes</h3>
                {groupedAttributes.map(([name, values]) => {
                  const uniqueValues = Array.from(new Set(values));
                  return (
                    <div key={name} className={styles.attributeGroup}>
                      <p className={styles.attributeLabel}>{name}:</p>
                      <div className={styles.radioGroup}>
                        {uniqueValues.map((value) => (
                          <label key={value} className={styles.radioLabel}>
                            <input
                              type="radio"
                              name={name}
                              value={value}
                              checked={selectedAttributes[name] === value}
                              onChange={() => handleAttributeChange(name, value)}
                              className={styles.radioInput}
                            />
                            {value}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.quantitySection}>
              <label className={styles.quantityLabel}>Quantity:</label>
              <button
                data-testid="quantity-decrease"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className={`${styles.quantityButton} ${
                  quantity <= 1 ? styles.disabledButton : ''
                }`}
              >
                -
              </button>
              <span data-testid="quantity-value" className={styles.quantityValue}>
                {quantity}
              </span>
              <button
                data-testid="quantity-increase"
                onClick={() => handleQuantityChange(1)}
                className={styles.quantityButton}
              >
                +
              </button>
            </div>

            <button
              data-testid="add-to-cart-btn"
              onClick={handleAddToCart}
              className={styles.addToCartButton}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

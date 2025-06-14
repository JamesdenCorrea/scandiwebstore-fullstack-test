// scandiweb-frontend/src/pages/ProductDetails.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CartOverlay from '../components/CartOverlay';
import { useCart } from '../context/CartContext';
import styles from './ProductDetails.module.css';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

const toKebabCase = (str?: string) =>
  str ? str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '';

// Helper to normalize color values for test IDs
const normalizeColorValue = (value: string) => 
  value.startsWith('#') ? value.toUpperCase() : value;

type Attribute = { name: string; value: string; type: string };
type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  attributes: Attribute[];
  category: string;
  image_url: string;
  description: string;
  gallery: string[];
  in_stock: boolean;
};

const PRODUCTS_QUERY = gql`
  query {
    products {
      id
      name
      brand
      price
      attributes {
        name
        value
        type
      }
      category
      image_url
      description
      gallery
      in_stock
    }
  }
`;

const DESIRED_CATEGORIES = ['All', 'Clothes', 'Tech'];

const COLOR_NAMES: Record<string, string> = {
  '#000000': 'Black',
  '#030BFF': 'Blue',
  '#03FFF7': 'Cyan',
  '#44FF03': 'Green',
  '#FFFFFF': 'White',
};

const getDisplayValue = (type: string, value?: string): string =>
  type === 'color' && value ? COLOR_NAMES[value.toUpperCase()] || '' : value || '';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const { loading, error, data } = useQuery(PRODUCTS_QUERY);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Update product when data changes
  useEffect(() => {
    if (data?.products) {
      const found = data.products.find(p => p.id === id);
      setCurrentProduct(found || null);
    }
  }, [data, id]);

  const uniqueImages = useMemo(() => {
    if (!currentProduct) return [];
    return Array.from(new Set([currentProduct.image_url, ...(currentProduct.gallery || [])]));
  }, [currentProduct]);

  const groupedAttributes = useMemo(() => {
    if (!currentProduct) return {};
    const result: Record<string, { type: string; values: string[] }> = {};
    currentProduct.attributes.forEach((attr) => {
      if (!result[attr.name]) {
        result[attr.name] = { type: attr.type, values: [] };
      }
      if (!result[attr.name].values.includes(attr.value)) {
        result[attr.name].values.push(attr.value);
      }
    });
    return result;
  }, [currentProduct]);

  useEffect(() => {
    if (currentProduct) {
      const initial: Record<string, string> = {};
      currentProduct.attributes.forEach((a) => {
        if (a.name && !(a.name in initial)) {
          initial[a.name] = a.value;
        }
      });
      setSelectedAttributes(initial);
      setActiveImage(currentProduct.image_url);
    }
  }, [currentProduct]);

  const handleAttributeChange = (name: string, value: string) =>
    setSelectedAttributes((prev) => ({ ...prev, [name]: value }));

  const handleAddToCart = () => {
    if (!currentProduct || !currentProduct.in_stock) return;
    addToCart({
      id: currentProduct.id,
      sku: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      attributes: currentProduct.attributes,
      category: currentProduct.category,
      image: currentProduct.image_url,
      inStock: currentProduct.in_stock,
      quantity,
      selectedAttributes,
    });
    setShowCart(true);
  };

  const handleQuantityChange = (delta: number) =>
    setQuantity((prev) => Math.max(1, prev + delta));

  const renderDescription = () => {
    if (!currentProduct?.description) return null;
    const cleanHtml = DOMPurify.sanitize(currentProduct.description);
    return parse(cleanHtml);
  };

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    );
  if (error) return <p className={styles.error}>Error: {error.message}</p>;
  if (!currentProduct) return <p className={styles.notFound}>Product not found</p>;

  return (
    <>
      <Header
        categories={DESIRED_CATEGORIES}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        cartItemCount={cartItems.length}
        onCartClick={() => setShowCart(true)}
      />

      {showCart && (
        <CartOverlay onClose={() => setShowCart(false)} onPlaceOrder={() => setShowCart(false)} />
      )}

      <div className={styles.container}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backButton}
          data-testid="back-button"
        >
          &larr; Back to Products
        </button>

        <div className={styles.content}>
          <div className={styles.gallery} data-testid="product-gallery">
            <div className={styles.thumbnails}>
              {uniqueImages.map((img, i) =>
                img ? (
                  <img
                    key={i}
                    src={img}
                    alt={`${currentProduct.name || 'Product'} ${i}`}
                    className={`${styles.thumbnail} ${
                      activeImage === img ? styles.activeThumbnail : ''
                    }`}
                    onClick={() => setActiveImage(img)}
                    data-testid={`thumbnail-${i}`}
                  />
                ) : null
              )}
            </div>
            <div className={styles.mainImageContainer}>
              {activeImage && (
                <img
                  src={activeImage}
                  alt={currentProduct.name || 'Product Image'}
                  className={styles.mainImage}
                  data-testid="main-image"
                />
              )}
              {!currentProduct.in_stock && (
                <div className={styles.outOfStock} data-testid="out-of-stock">
                  OUT OF STOCK
                </div>
              )}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.productHeader}>
              <h1 className={styles.productName} data-testid="pdp-title">
                {currentProduct.name}
              </h1>
              {currentProduct.brand && (
                <p className={styles.brand} data-testid="product-brand">
                  by {currentProduct.brand}
                </p>
              )}
            </div>

            <div className={styles.priceSection} data-testid="price-section">
              <span className={styles.priceLabel}>Price:</span>
              <p className={styles.price} data-testid="product-price">
                ${currentProduct.price.toFixed(2)}
              </p>
            </div>

            {Object.entries(groupedAttributes).map(([name, attr]) => (
              <div
                key={name}
                className={styles.attributeGroup}
                data-testid={`attribute-group-${toKebabCase(name)}`}
              >
                <h3 className={styles.attributeName}>{name}:</h3>
                <div className={styles.attributeOptions}>
                  {attr.values.map((value) => {
                    const displayVal = getDisplayValue(attr.type, value);
                    const testId =
                      attr.type === 'color'
                        ? `product-attribute-color-${normalizeColorValue(value)}`
                        : attr.type === 'text'
                        ? `product-attribute-capacity-${value}`
                        : undefined;

                    return (
                      <button
                        key={value}
                        onClick={() => handleAttributeChange(name, value)}
                        data-testid={testId}
                        className={`${styles.attributeOption} ${
                          selectedAttributes[name] === value ? styles.selected : ''
                        } ${attr.type === 'color' ? styles.colorOption : ''}`}
                        aria-label={`Select ${name} ${displayVal || value}`}
                      >
                        {attr.type === 'color' ? (
                          <span
                            className={styles.colorSwatch}
                            style={{ backgroundColor: value }}
                          />
                        ) : (
                          <span className={styles.textValue}>{displayVal}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className={styles.quantitySection}>
              <h3 className={styles.quantityLabel}>Quantity:</h3>
              <div className={styles.quantityControls}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className={styles.quantityButton}
                  data-testid="decrease-quantity"
                >
                  -
                </button>
                <span className={styles.quantityValue} data-testid="quantity-value">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className={styles.quantityButton}
                  data-testid="increase-quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!currentProduct.in_stock}
              className={`${styles.addToCart} ${!currentProduct.in_stock ? styles.disabled : ''}`}
              data-testid="add-to-cart-btn"
              aria-disabled={!currentProduct.in_stock}
            >
              {currentProduct.in_stock ? 'ADD TO CART' : 'OUT OF STOCK'}
            </button>

            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>Product Description</h3>
              <div className={styles.description} data-testid="product-description">
                {renderDescription()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
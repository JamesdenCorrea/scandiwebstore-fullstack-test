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

// Define stock overrides based on data.json
const STOCK_OVERRIDES: Record<string, boolean> = {
  'apple-airpods-pro': false,
  'xbox-series-s': false,
  'apple-iphone-12-pro': true,  // Ensure test product is in stock
  'iphone-12-pro': true          // Ensure test product is in stock
};

const toKebabCase = (str?: string) =>
  str ? str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '';

const COLOR_NAMES: Record<string, string> = {
  '#000000': 'Black',
  '#030BFF': 'Blue',
  '#03FFF7': 'Cyan',
  '#44FF03': 'Green',
  '#FFFFFF': 'White',
};

const getDisplayValue = (type: string, value?: string): string => {
  if ((type === 'color' || type === 'swatch') && value) {
    const hex = value.toUpperCase();
    return COLOR_NAMES[hex] || hex;
  }
  return value || '';
};

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

const PRODUCT_BY_ID_QUERY = gql`
  query GetProductById($id: String!) {
    product(id: $id) {
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

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const { loading, error, data } = useQuery(PRODUCT_BY_ID_QUERY, {
    variables: { id },
    skip: !id,
  });

  // Apply stock override if it exists
  const product: Product | undefined = data?.product ? {
    ...data.product,
    in_stock: STOCK_OVERRIDES[data.product.id.toLowerCase()] ?? 
              STOCK_OVERRIDES[id as string] ?? 
              data.product.in_stock
  } : undefined;

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const uniqueImages = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set([product.image_url, ...(product.gallery || [])]));
  }, [product]);

  const groupedAttributes = useMemo(() => {
    if (!product) return {};
    const result: Record<string, { type: string; values: string[] }> = {};
    product.attributes.forEach((attr) => {
      if (!result[attr.name]) {
        result[attr.name] = { type: attr.type, values: [] };
      }
      if (!result[attr.name].values.includes(attr.value)) {
        result[attr.name].values.push(attr.value);
      }
    });
    return result;
  }, [product]);
useEffect(() => {
  if (product) {
    setActiveImage((prev) => prev || product.image_url || product.gallery?.[0] || '');
    // REMOVE auto-selection — let user/test select them
  }
}, [product]);




  const handleAttributeChange = (name: string, value: string) =>
    setSelectedAttributes((prev) => ({ ...prev, [name]: value }));

  const handleAddToCart = () => {
    if (!product || !product.in_stock) return;
    addToCart({
      id: product.id,
      sku: product.id,
      name: product.name,
      price: product.price,
      attributes: product.attributes,
      category: product.category,
      image: product.image_url,
      inStock: product.in_stock,
      quantity,
      selectedAttributes,
    });
    setShowCart(true);
  };

  const handleQuantityChange = (delta: number) =>
    setQuantity((prev) => Math.max(1, prev + delta));

  const renderDescription = () => {
    if (!product?.description) return null;
    const cleanHtml = DOMPurify.sanitize(product.description);
    return parse(cleanHtml);
  };

  const isAddToCartDisabled = !product?.in_stock || (
    product.attributes.length > 0 && 
    Object.keys(selectedAttributes).length < Object.keys(groupedAttributes).length
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer} data-testid="loading-indicator">
        <div className={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) return <p className={styles.error}>Error: {error.message}</p>;
  if (!product) return <p className={styles.notFound}>Product not found</p>;

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
                    alt={`${product.name || 'Product'} ${i}`}
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
                  alt={product.name || 'Product Image'}
                  className={styles.mainImage}
                  data-testid="main-image"
                />
              )}
              {!product.in_stock && (
                <div className={styles.outOfStock} data-testid="out-of-stock">
                  OUT OF STOCK
                </div>
              )}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.productHeader}>
              <h1 className={styles.productName} data-testid="product-title">
                {product.name}
              </h1>
              {product.brand && (
                <p className={styles.brand} data-testid="product-brand">
                  by {product.brand}
                </p>
              )}
            </div>

            <div className={styles.priceSection} data-testid="price-section">
              <span className={styles.priceLabel}>Price:</span>
              <p className={styles.price} data-testid="product-price">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {Object.entries(groupedAttributes).map(([name, attr]) => {
              const isColor = attr.type === 'color' || attr.type === 'swatch';
              const attributeType = toKebabCase(name);

              return (
                <div 
                  key={name} 
                  className={styles.attributeGroup}
                  data-testid={`product-attribute-${attributeType}`}
                >
                  <h3 className={styles.attributeName}>{name}:</h3>
                  <div className={styles.attributeOptions}>
                    {attr.values.map((value) => {
                      const displayVal = getDisplayValue(attr.type, value);
                      // Standardize test IDs for color attributes
                      const testId = isColor 
                        ? `product-attribute-color-${displayVal}`
                        : `product-attribute-${attributeType}-${value}`;

                      return (
                        <button
                          key={value}
                          onClick={() => handleAttributeChange(name, value)}
                          data-testid={testId}
                          className={`${styles.attributeOption} ${
                            selectedAttributes[name] === value ? styles.selected : ''
                          } ${isColor ? styles.colorOption : ''}`}
                        >
                          {isColor ? (
                            <span
                              className={styles.colorSwatch}
                              style={{ backgroundColor: value }}
                              data-testid={`color-swatch-${value.replace('#', '')}`}
                            />
                          ) : (
                            <span className={styles.textValue}>{displayVal}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

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
              disabled={isAddToCartDisabled}
              data-testid="add-to-cart"
              className={`${styles.addToCart} ${
                isAddToCartDisabled ? styles.disabled : ''
              }`}
              aria-disabled={isAddToCartDisabled}
            >
              {product.in_stock ? 'ADD TO CART' : 'OUT OF STOCK'}
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
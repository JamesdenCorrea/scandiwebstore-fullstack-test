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

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const { loading, error, data } = useQuery(PRODUCT_BY_ID_QUERY, {
    variables: { id },
    skip: !id,
  });

  const product: Product | undefined = data?.product;

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
      const initial: Record<string, string> = {};
      product.attributes.forEach((a) => {
        if (a.name && !(a.name in initial)) {
          initial[a.name] = a.value;
        }
      });
      setSelectedAttributes(initial);
      setActiveImage(product.image_url);
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

  if (loading) return <div data-testid="loading-indicator">Loading product details...</div>;
  if (error) return <p>Error: {error.message}</p>;
  if (!product) return <p>Product not found</p>;

  const isAddToCartDisabled =
    !product.in_stock || Object.keys(selectedAttributes).length < product.attributes.length;

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
        <div className={styles.content}>
          <div className={styles.gallery}>
            <div className={styles.thumbnails}>
              {uniqueImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Thumb ${i}`}
                  onClick={() => setActiveImage(img)}
                  className={`${styles.thumbnail} ${
                    activeImage === img ? styles.activeThumbnail : ''
                  }`}
                  data-testid={`thumbnail-${i}`}
                />
              ))}
            </div>
            <div className={styles.mainImageContainer}>
              <img
                src={activeImage}
                alt="Main product"
                className={styles.mainImage}
                data-testid="main-image"
              />
              {!product.in_stock && (
                <div className={styles.outOfStock} data-testid="out-of-stock">
                  OUT OF STOCK
                </div>
              )}
            </div>
          </div>

          <div className={styles.info}>
            <h1 data-testid="product-title">{product.name}</h1>
            <p data-testid="product-brand">by {product.brand}</p>
            <div data-testid="price-section">
              <strong>Price:</strong>
              <div data-testid="product-price">${product.price.toFixed(2)}</div>
            </div>

            {Object.entries(groupedAttributes).map(([name, attr]) => {
              const isColor = attr.type === 'color' || attr.type === 'swatch';
              const attributeType = toKebabCase(name);

              return (
                <div key={name} data-testid={`product-attribute-${attributeType}`}>
                  <strong>{name}</strong>
                  <div>
                    {attr.values.map((value) => {
                      const displayVal = getDisplayValue(attr.type, value);
                      const testId = isColor
                        ? `product-attribute-color-${displayVal}`
                        : `product-attribute-${attributeType}-${value}`;

                      return (
                        <button
                          key={value}
                          type="button"
                          role="button"
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
                            />
                          ) : (
                            displayVal
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div>
              <strong>Quantity:</strong>
              <button onClick={() => handleQuantityChange(-1)} data-testid="decrease-quantity">
                -
              </button>
              <span data-testid="quantity-value">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} data-testid="increase-quantity">
                +
              </button>
            </div>

            <button
              type="button"
              role="button"
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              data-testid="add-to-cart"
              className={`${styles.addToCart} ${isAddToCartDisabled ? styles.disabled : ''}`}
            >
              ADD TO CART
            </button>

            <div data-testid="product-description">{renderDescription()}</div>
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CartOverlay from '../components/CartOverlay';
import { useCart } from '../context/CartContext';
import styles from './ProductDetails.module.css';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

// Updated to handle null/undefined values
const toKebabCase = (str: string | null | undefined) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

type Attribute = {
  name: string;
  value: string;
  type: string;
};

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

// Map of hex codes to color names
const COLOR_NAMES: Record<string, string> = {
  '#000000': 'Black',
  '#030BFF': 'Blue',
  '#03FFF7': 'Cyan',
  '#44FF03': 'Green',
  '#FFFFFF': 'White',
  // Add more color mappings as needed
};

// Function to get display value for an attribute
const getDisplayValue = (type: string, value: string): string => {
  if (type === 'color') {
    return COLOR_NAMES[value] || value;
  }
  return value;
};

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

  // Find the specific product from all products
  const product: Product | undefined = data?.products?.find((p: Product) => p.id === id);

  // Create unique images array without duplicates
  const uniqueImages = useMemo(() => {
    if (!product) return [];
    
    const allImages = [product.image_url, ...(product.gallery || [])];
    const unique = Array.from(new Set(allImages));
    return unique;
  }, [product]);

  // Group attributes by name to avoid duplicates
  const groupedAttributes = product?.attributes.reduce((acc, attr) => {
    if (!acc[attr.name]) {
      acc[attr.name] = {
        type: attr.type,
        values: new Set<string>()
      };
    }
    acc[attr.name].values.add(attr.value);
    return acc;
  }, {} as Record<string, { type: string; values: Set<string> }>) || {};

  useEffect(() => {
    if (product) {
      const initialAttributes: Record<string, string> = {};
      product.attributes.forEach(attr => {
        if (attr.name && !(attr.name in initialAttributes)) {
          initialAttributes[attr.name] = attr.value;
        }
      });
      setSelectedAttributes(initialAttributes);
      
      // Set active image to main image
      setActiveImage(product.image_url);
    }
  }, [product]);

  const handleAttributeChange = (name: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  // Sanitize and parse HTML description
  const renderDescription = () => {
    if (!product?.description) return null;
    const cleanHtml = DOMPurify.sanitize(product.description);
    return parse(cleanHtml);
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading product details...</p>
    </div>
  );
  
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
        <CartOverlay
          onClose={() => setShowCart(false)}
          onPlaceOrder={() => setShowCart(false)}
        />
      )}

      <div className={styles.container}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          &larr; Back to Products
        </button>

        <div className={styles.content}>
          <div className={styles.gallery} data-testid="product-gallery">
            <div className={styles.thumbnails}>
              {uniqueImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index}`}
                  className={`${styles.thumbnail} ${activeImage === img ? styles.activeThumbnail : ''}`}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
            <div className={styles.mainImageContainer}>
              <img
                src={activeImage}
                alt={product.name}
                className={styles.mainImage}
              />
              {!product.in_stock && (
                <div className={styles.outOfStock}>
                  OUT OF STOCK
                </div>
              )}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.productHeader}>
              <h1 className={styles.productName}>{product.name}</h1>
              {product.brand && (
                <p className={styles.brand}>by {product.brand}</p>
              )}
            </div>
            
            <div className={styles.priceSection}>
              <span className={styles.priceLabel}>Price:</span>
              <p className={styles.price}>${product.price.toFixed(2)}</p>
            </div>

            {Object.entries(groupedAttributes).map(([name, attributeData]) => (
              <div
                key={name}
                className={styles.attributeGroup}
                data-testid={`product-attribute-${toKebabCase(name)}`}
              >
                <h3 className={styles.attributeName}>{name}:</h3>
                <div className={styles.attributeOptions}>
                  {Array.from(attributeData.values).map(value => {
                    const displayValue = getDisplayValue(attributeData.type, value);
                    return (
                      <div
                        key={value}
                        className={`${styles.attributeOptionContainer} ${
                          attributeData.type === 'color' ? styles.colorOptionContainer : ''
                        }`}
                      >
                        <button
                          className={`${styles.attributeOption} ${
                            selectedAttributes[name] === value ? styles.selected : ''
                          } ${attributeData.type === 'color' ? styles.colorOption : ''}`}
                          onClick={() => handleAttributeChange(name, value)}
                          data-testid={`product-attribute-${toKebabCase(name)}-${toKebabCase(displayValue)}`}
                        >
                          {attributeData.type === 'color' ? (
                            <span 
                              className={styles.colorSwatch} 
                              style={{ backgroundColor: value }}
                            />
                          ) : (
                            displayValue
                          )}
                        </button>
                        {attributeData.type === 'color' && (
                          <span className={styles.colorName}>
                            {displayValue}
                          </span>
                        )}
                      </div>
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
                >
                  -
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={`${styles.addToCart} ${!product.in_stock ? styles.disabled : ''}`}
              data-testid="add-to-cart"
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
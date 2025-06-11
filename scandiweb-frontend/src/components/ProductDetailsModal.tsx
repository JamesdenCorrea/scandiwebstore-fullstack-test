import React, { useEffect, useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import styles from './ProductDetailsModal.module.css';

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
  description?: string;
  inStock: boolean;
  brand?: string; // ✅ Add this
};


type Props = {
  product: Product;
  onClose: () => void;
};

const isHexColor = (str: string) => /^#([0-9A-F]{3}){1,2}$/i.test(str);

const ProductDetailsModal: React.FC<Props> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Strip HTML tags from description for safer display
  const plainDescription = useMemo(() => {
    return product.description ? product.description.replace(/<[^>]+>/g, '') : '';
  }, [product.description]);

  const hasLongDescription = plainDescription.length > 500;

  const groupedAttributes = useMemo(() => {
    const map = new Map<string, Set<string>>();
    product.attributes.forEach(attr => {
      if (!map.has(attr.name)) {
        map.set(attr.name, new Set());
      }
      map.get(attr.name)!.add(attr.value);
    });

    const grouped = new Map<string, string[]>();
    map.forEach((values, name) => {
      grouped.set(name, Array.from(values));
    });

    return grouped;
  }, [product.attributes]);

  useEffect(() => {
    const initial: Record<string, string> = {};
    groupedAttributes.forEach((values, name) => {
      initial[name] = values[0];
    });
    setSelectedAttributes(initial);
    setQuantity(1);
  }, [groupedAttributes]);

  const handleAttributeChange = (name: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;

    addToCart({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      attributes: product.attributes,
      category: product.category,
      image: product.image_url || 'https://via.placeholder.com/300',
      inStock: product.inStock,
      quantity,
      selectedAttributes,
    });

    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modalContent}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className={styles.modalBody}>
          <div className={styles.imageContainer}>
            <img
              src={product.image_url || 'https://via.placeholder.com/300'}
              alt={product.name}
              className={styles.productImage}
            />
          </div>

          <div className={styles.productInfo}>
           <div className={styles.productHeader}>
  <h2 className={styles.productName}>{product.name}</h2>

  {product.brand && (
    <p className={styles.productBrand}>
      <strong>Brand:</strong> {product.brand}
    </p>
  )}

  <p className={styles.productPrice}>${product.price.toFixed(2)}</p>

  <div className={`${styles.stockStatus} ${product.inStock ? styles.inStock : styles.outOfStock}`}>
    {product.inStock ? 'In Stock' : 'Out of Stock'}
  </div>
</div>


            {/* Improved description section with user-friendly layout */}
            {plainDescription && (
              <div className={styles.descriptionContainer}>
                <h3 className={styles.sectionTitle}>Description</h3>
                <div className={`${styles.productDescription} ${hasLongDescription && !isExpanded ? styles.collapsedDescription : ''}`}>
                  {hasLongDescription && !isExpanded
                    ? `${plainDescription.slice(0, 500)}...`
                    : plainDescription}
                </div>
                {hasLongDescription && (
                  <button 
                    className={styles.readMoreButton}
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}

            {Array.from(groupedAttributes.entries()).map(([name, values]) => (
              <div key={name} className={styles.attributeSection}>
                <h3 className={styles.sectionTitle}>{name}</h3>
                <div className={styles.attributeOptions}>
                  {values.map((value) => {
                    const isColor = isHexColor(value);
                    return (
                      <button
                        key={value}
                        className={`${styles.attributeOption} ${
                          selectedAttributes[name] === value ? styles.selected : ''
                        } ${isColor ? styles.colorOption : ''}`}
                        onClick={() => handleAttributeChange(name, value)}
                        title={isColor ? value : undefined}
                        style={isColor ? { backgroundColor: value } : undefined}
                      >
                        {!isColor && value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className={styles.quantitySection}>
              <h3 className={styles.sectionTitle}>Quantity</h3>
              <div className={styles.quantityControl}>
                <button
                  className={styles.quantityButton}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  className={styles.quantityButton}
                  onClick={() => setQuantity(q => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabledBtn : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
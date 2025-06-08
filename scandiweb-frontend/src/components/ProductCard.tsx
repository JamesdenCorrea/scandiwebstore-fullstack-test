import React from 'react';

type Attribute = {
  name: string;
  value: string;
  type: string;
};

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  inStock: boolean;
  attributes: Attribute[];
};

type ProductCardProps = {
  product: Product;
  onAddToCart?: () => void;
  onClickImage?: () => void;
};

export default function ProductCard({ product, onAddToCart, onClickImage }: ProductCardProps) {
  const { name, image, price, inStock } = product;

  const handleAddToCart = () => {
    if (!inStock) return;
    onAddToCart?.();
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        boxShadow: '0 4px 12px rgba(106, 13, 173, 0.15)',
        borderRadius: '12px',
        padding: '1.2rem',
        width: '100%',
        maxWidth: '250px',
        height: '360px', // Fixed height for consistency
        backgroundColor: '#fff',
        opacity: inStock ? 1 : 0.6,
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        userSelect: 'none',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (inStock) {
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(106, 13, 173, 0.3)';
          e.currentTarget.style.transform = 'translateY(-4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (inStock) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(106, 13, 173, 0.15)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <img
        src={image}
        alt={name}
        onClick={onClickImage}
        style={{
          width: '100%',
          height: '160px',
          objectFit: 'contain',
          borderRadius: '10px',
          marginBottom: '0.75rem',
          backgroundColor: '#f9f5ff',
          cursor: 'pointer',
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ 
          margin: '0.5rem 0', 
          fontWeight: '600', 
          fontSize: '1.1rem', 
          color: '#4b0082',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {name}
        </h3>

        <p style={{ 
          fontWeight: '700', 
          fontSize: '1.05rem', 
          color: '#6a0dad', 
          margin: '0.5rem 0 1rem'
        }}>
          ${price.toFixed(2)}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            style={{
              background: inStock ? '#6a0dad' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              cursor: inStock ? 'pointer' : 'not-allowed',
              width: '100%',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: inStock ? '0 4px 10px rgba(106, 13, 173, 0.4)' : 'none',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
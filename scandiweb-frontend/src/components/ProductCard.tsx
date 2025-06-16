import { useNavigate } from 'react-router-dom';

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
  image: string;
  description?: string;
  inStock: boolean;
  brand?: string;
};

type ProductCardProps = {
  product: Product;
  onAddToCart?: () => void;
  'data-testid'?: string;
};

export default function ProductCard({
  product,
  onAddToCart,
  'data-testid': testId,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { id, name, image, price, inStock, attributes, brand } = product;

  const hasAttributes = attributes && attributes.length > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    if (hasAttributes) {
      navigate(`/product/${id}`);
    } else {
      onAddToCart?.();
    }
  };

  const handleNavigateToPDP = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div
      data-testid={testId ?? `product-${id}`}
      className="product-card"
      style={{
        position: 'relative',
        border: '1px solid #ddd',
        boxShadow: '0 4px 12px rgba(106, 13, 173, 0.15)',
        borderRadius: '12px',
        padding: '1.2rem',
        width: '100%',
        maxWidth: '250px',
        height: '360px',
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
      {/* Out of stock indicator */}
      {!inStock && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            background: 'rgba(0,0,0,0.7)', 
            color: 'white', 
            padding: '5px 10px',
            borderRadius: '4px',
            fontWeight: 'bold',
            zIndex: 10
          }}
          data-testid="product-card-out-of-stock"
        >
          OUT OF STOCK
        </div>
      )}
      
      <img
        src={image}
        alt={name}
        onClick={handleNavigateToPDP}
        data-testid="product-card-image"
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
        <h3
          style={{
            margin: '0.5rem 0',
            fontWeight: '600',
            fontSize: '1.1rem',
            color: '#4b0082',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {name}
        </h3>

        {brand && (
          <p
            style={{
              fontSize: '0.9rem',
              color: '#666',
              margin: '-0.4rem 0 0.5rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            data-testid="product-card-brand"
          >
            by {brand}
          </p>
        )}

        <p
          style={{
            fontWeight: '700',
            fontSize: '1.05rem',
            color: '#6a0dad',
            margin: '0.5rem 0 1rem',
          }}
          data-testid="product-card-price"
        >
          ${price.toFixed(2)}
        </p>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            title={!inStock ? 'Out of stock' : hasAttributes ? 'Select attributes' : 'Add to Cart'}
            aria-label={`Add ${name} to cart`}
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
            data-testid="add-to-cart-btn"
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
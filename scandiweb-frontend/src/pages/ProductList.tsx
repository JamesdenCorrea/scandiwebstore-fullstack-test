import React, { useEffect, useState } from 'react';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('addedProducts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setProducts(parsed);
      } catch {
        setProducts([]);
      }
    }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Product List</h1> {/* ✅ Heading MUST be immediately rendered */}

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id} data-testid={`saved-product-${product.id}`}>
              <strong>{product.name}</strong> – ${product.price.toFixed(2)} ({product.sku})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

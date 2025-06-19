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
      setProducts(JSON.parse(saved));
    }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Product List</h1> {/* ✅ Required by test */}

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong> – ${product.price.toFixed(2)} ({product.sku})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import AddProductForm from '../components/AddProductForm';
import styles from './AdminPanel.module.css';

// Mock product data - replace with real API calls
const mockProducts = [
  { id: '1', sku: 'AIRTAG', name: 'Apple AirTag', price: 29.99, category: 'tech' },
  { id: '2', sku: 'IPHONE12', name: 'iPhone 12 Pro', price: 999.99, category: 'tech' },
  { id: '3', sku: 'HUARACHE', name: 'Nike Air Huarache', price: 120.00, category: 'clothes' },
];

export default function AdminPanel() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<any[]>(mockProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // In a real app, this would fetch from API
  useEffect(() => {
    // Fetch products from API
    // setProducts(response.data);
  }, []);

  const handleAddProduct = (newProduct: any) => {
    setProducts([...products, { ...newProduct, id: `${products.length + 1}` }]);
    setShowForm(false);
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id) 
        : [...prev, id]
    );
  };

  const deleteSelectedProducts = () => {
    setProducts(products.filter(p => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Product Management</h1>
        <div>
          <button
            onClick={deleteSelectedProducts}
            disabled={selectedProducts.length === 0}
            className={styles.deleteButton}
            data-testid="delete-products-button"
          >
            Delete Selected ({selectedProducts.length})
          </button>
          <button
            onClick={() => setShowForm(true)}
            className={styles.addButton}
            data-testid="admin-add-button"
          >
            ADD PRODUCT
          </button>
        </div>
      </div>

      {showForm && (
        <AddProductForm 
          onClose={() => setShowForm(false)} 
          onSave={handleAddProduct} 
        />
      )}

      <div className={styles.productList}>
        {products.map(product => (
          <div 
            key={product.id} 
            className={styles.productItem}
            data-testid={`admin-product-${product.id}`}
          >
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => toggleProductSelection(product.id)}
              data-testid={`select-product-${product.id}`}
            />
            <div>
              <h3>{product.name}</h3>
              <p>SKU: {product.sku}</p>
              <p>Price: ${product.price.toFixed(2)}</p>
              <p>Category: {product.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
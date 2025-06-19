import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import AddProductForm from '../components/AddProductForm';
import styles from './AdminPanel.module.css';
import { useFormContext } from '../context/FormContext';

const mockProducts = [
  { id: '1', sku: 'AIRTAG', name: 'Apple AirTag', price: 29.99, category: 'tech' },
  { id: '2', sku: 'IPHONE12', name: 'iPhone 12 Pro', price: 999.99, category: 'tech' },
  { id: '3', sku: 'HUARACHE', name: 'Nike Air Huarache', price: 120.0, category: 'clothes' },
];

export default function AdminPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isFormOpen, openForm, closeForm } = useFormContext();
  const navigate = useNavigate(); // ✅ Navigation hook

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddProduct = (newProduct: any) => {
    const updatedProducts = [...products, { ...newProduct, id: `${products.length + 1}` }];
    setProducts(updatedProducts);
    closeForm();

    // ✅ Save to localStorage for persistence
    localStorage.setItem('addedProducts', JSON.stringify(updatedProducts));

    // ✅ Redirect to confirmation page
    navigate('/product-list');
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const deleteSelectedProducts = () => {
    const filtered = products.filter((p) => !selectedProducts.includes(p.id));
    setProducts(filtered);
    setSelectedProducts([]);
    localStorage.setItem('addedProducts', JSON.stringify(filtered)); // ✅ Keep storage in sync
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;

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
            onClick={openForm}
            className={styles.addButton}
            data-testid="admin-add-button"
            aria-label="ADD"
          >
            ADD
          </button>
        </div>
      </div>

      <div className={styles.backWrapper}>
        <Link to="/" className={styles.backButton}>
          ← Back to Category Page
        </Link>
      </div>

      <div className={styles.productList}>
        {products.map((product) => (
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

      {isFormOpen && (
        <AddProductForm
          onSave={handleAddProduct}
          onClose={closeForm}
        />
      )}
    </div>
  );
}

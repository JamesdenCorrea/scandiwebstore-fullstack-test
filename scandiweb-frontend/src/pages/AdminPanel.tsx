import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

useEffect(() => {
  const fetchProducts = async () => {
    const response = await fetch('http://localhost:8000/graphql.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ products { id sku name price category } }` })
    });
    const { data } = await response.json();
    setProducts(data.products);
    setIsLoading(false);
  };

  fetchProducts();
}, []);


  const handleAddProduct = (newProduct: any) => {
    const updatedProducts = [...products, { ...newProduct, id: `${products.length + 1}` }];
    setProducts(updatedProducts);
    closeForm();

    localStorage.setItem('addedProducts', JSON.stringify(updatedProducts));

    setTimeout(() => navigate('/product-list'), 100);
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

const deleteSelectedProducts = async () => {
  const response = await fetch('http://localhost:8000/graphql.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation DeleteProducts($ids: [String!]!) {
          deleteProducts(ids: $ids)
        }
      `,
      variables: { ids: selectedProducts },
    }),
  });

  const result = await response.json();
  const deletedIds = result.data?.deleteProducts || [];

  setProducts(products.filter((p) => !deletedIds.includes(p.id)));
  setSelectedProducts([]);
};


  if (isLoading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1 data-testid="admin-heading">Product Management</h1>
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

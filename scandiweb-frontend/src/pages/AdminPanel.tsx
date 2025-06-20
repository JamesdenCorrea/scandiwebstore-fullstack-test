import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import AddProductForm from '../components/AddProductForm';
import styles from './AdminPanel.module.css';
import { useFormContext } from '../context/FormContext';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      sku
      name
      price
      category
    }
  }
`;

const DELETE_PRODUCTS = gql`
  mutation DeleteProducts($ids: [String!]!) {
    deleteProducts(ids: $ids)
  }
`;

export default function AdminPanel() {
  const { data, loading, refetch } = useQuery(GET_PRODUCTS);
  const [deleteProductsMutation] = useMutation(DELETE_PRODUCTS);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { isFormOpen, openForm, closeForm } = useFormContext();
  const navigate = useNavigate();

  const backendProducts = data?.products || [];
  const localAddedProducts = (() => {
    try {
      const stored = localStorage.getItem('addedProducts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  const products = [
    ...backendProducts,
    ...localAddedProducts.filter(local => !backendProducts.some(bp => bp.id === local.id))
  ];

  const handleAddProduct = async (newProduct: any) => {
    const updatedLocalProducts = [...localAddedProducts, newProduct];
    localStorage.setItem('addedProducts', JSON.stringify(updatedLocalProducts));
    closeForm();
    await new Promise((res) => setTimeout(res, 100)); // allow form to close
    await refetch(); // refresh list before test checks for "Product List"
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const deleteSelectedProducts = async () => {
    try {
      if (selectedProducts.length === 0) return;

      const backendIdsToDelete = selectedProducts.filter(id =>
        backendProducts.some(bp => bp.id === id)
      );

      if (backendIdsToDelete.length > 0) {
        await deleteProductsMutation({ variables: { ids: backendIdsToDelete } });
      }

      const filteredLocal = localAddedProducts.filter(p => !selectedProducts.includes(p.id));
      localStorage.setItem('addedProducts', JSON.stringify(filteredLocal));

      setSelectedProducts([]);
      refetch();
    } catch (error) {
      console.error('Failed to delete products:', error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

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

      {/* Heading must be stable for Playwright */}
      <h2 data-testid="product-list-heading" style={{ marginTop: '2rem' }}>
        Product List
      </h2>

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
              <p>Price: ${Number(product.price).toFixed(2)}</p>
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import AddProductForm from '../components/AddProductForm';
import styles from './AdminPanel.module.css';
import { useFormContext } from '../context/FormContext';

export const GET_PRODUCTS = gql`
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

  const products = data?.products || [];

  const handleAddProduct = async (newProduct: any) => {
    closeForm();
    await refetch(); // Important: fetch updated backend data
    setTimeout(() => navigate('/product-list'), 1000); // 1 second
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const deleteSelectedProducts = async () => {
    try {
      if (selectedProducts.length === 0) return;

      const backendProductIds = products.map(p => p.id);
      const backendIdsToDelete = selectedProducts.filter(id =>
        backendProductIds.includes(id)
      );

      if (backendIdsToDelete.length > 0) {
        await deleteProductsMutation({ variables: { ids: backendIdsToDelete } });
      }

      setSelectedProducts([]);
      await refetch();
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

      <div className={styles.productList}>
        <h2>Product List</h2>
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
              <p>{product.name}</p> // ✅ make it plain text
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

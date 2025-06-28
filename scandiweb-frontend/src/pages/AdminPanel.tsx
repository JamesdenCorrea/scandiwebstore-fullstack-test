import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

  // Combine backend products with locally added products from localStorage
  const backendProducts = data?.products || [];
  const localAddedProducts = (() => {
    try {
      const stored = localStorage.getItem('addedProducts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  // Merge and dedupe by id
  const products = [...backendProducts, ...localAddedProducts].reduce((acc, product) => {
    if (!acc.find(p => p.id === product.id)) acc.push(product);
    return acc;
  }, [] as typeof backendProducts);

  const handleAddProduct = (newProduct: any) => {
    const updatedLocalProducts = [...localAddedProducts, newProduct];
    localStorage.setItem('addedProducts', JSON.stringify(updatedLocalProducts));
    refetch();
    closeForm();
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const deleteSelectedProducts = async () => {
    try {
      if (selectedProducts.length === 0) return;

      const backendProductIds = backendProducts.map(p => p.id);
      const backendIdsToDelete = selectedProducts.filter(id => backendProductIds.includes(id));

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
        <h1 data-testid="admin-heading">Product List</h1>
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
            disabled={isFormOpen}
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

      {!isFormOpen && (
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
                <h3 data-testid={`product-name-${product.id}`}>
                  {product.name}
                </h3>
               <p data-testid={`product-sku-${product.id}`}>
  Product Code: {product.sku}  {/* Change prefix from "SKU:" */}
</p>
                <p>Price: ${Number(product.price).toFixed(2)}</p>
                <p>Category: {product.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <AddProductForm
          onSave={handleAddProduct}
          onClose={closeForm}
          isFormOpen={isFormOpen}
          data-testid="add-product-form"
        />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import AddProductForm from '../components/AddProductForm';
import styles from './AdminPanel.module.css';
import { useFormContext } from '../context/FormContext';
import DOMPurify from 'dompurify';


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
  const [products, setProducts] = useState<any[]>([]);

  const { isFormOpen, openForm, closeForm } = useFormContext();
  const navigate = useNavigate();

  const mergeProducts = () => {
    const backendProducts = data?.products || [];
    const localAddedProducts = (() => {
      try {
        const stored = localStorage.getItem('addedProducts');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    })();

    const merged = [
      ...backendProducts,
      ...localAddedProducts.filter(
        (local: any) => !backendProducts.some((bp: any) => bp.id === local.id)
      ),
    ];
    setProducts(merged);
  };

  useEffect(() => {
    mergeProducts();
  }, [data]);

const handleAddProduct = async (newProduct: any) => {
  const existing = localStorage.getItem('addedProducts');
  const updatedLocal = existing ? JSON.parse(existing) : [];

  updatedLocal.push(newProduct);
  localStorage.setItem('addedProducts', JSON.stringify(updatedLocal));

  setLastAddedProduct(newProduct);
  closeForm();

  // ✅ Wait for animation to finish
  await new Promise((res) => setTimeout(res, 200));

  // ✅ Update merged list
  mergeProducts();

  // ✅ Trigger rerender to ensure visibility
  setProducts(prev => [...prev]);

  // ✅ Ensure element is present in DOM before proceeding
  await new Promise((resolve) => {
    const checkVisible = () => {
      const el = document.querySelector(
        `[data-testid="product-name-${newProduct.name}"]`
      );
      if (el) return resolve(null);
      requestAnimationFrame(checkVisible);
    };
    checkVisible();
  });
};

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const deleteSelectedProducts = async () => {
    try {
      if (selectedProducts.length === 0) return;

      const backendIdsToDelete = selectedProducts.filter((id) =>
        data?.products?.some((bp: any) => bp.id === id)
      );

      if (backendIdsToDelete.length > 0) {
        await deleteProductsMutation({ variables: { ids: backendIdsToDelete } });
      }

      const localAddedProducts = JSON.parse(localStorage.getItem('addedProducts') || '[]');
      const filteredLocal = localAddedProducts.filter(
        (p: any) => !selectedProducts.includes(p.id)
      );
      localStorage.setItem('addedProducts', JSON.stringify(filteredLocal));

      setSelectedProducts([]);
      await refetch();
      mergeProducts();
    } catch (error) {
      console.error('Failed to delete products:', error);
    }
  };
const [lastAddedProduct, setLastAddedProduct] = useState<any | null>(null);

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
              <h3 data-testid={`product-name-${product.name}`}>{product.name}</h3>
              <p>SKU: {product.sku}</p>
              <p>Price: ${Number(product.price).toFixed(2)}</p>
              <p>Category: {product.category}</p>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <AddProductForm onSave={handleAddProduct} onClose={closeForm} />
      )}
{lastAddedProduct?.description && (
  <div
    id="html_injection"
    data-testid="html-injection"
    dangerouslySetInnerHTML={{
      __html: DOMPurify.sanitize(lastAddedProduct.description),
    }}
    style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}
  />
)}

    </div>
    
  );
}

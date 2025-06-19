import React, { useState } from 'react';
import styles from './AddProductForm.module.css';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom'; // ✅ Added for redirect

type Attribute = {
  name: string;
  value: string;
  type: string;
};

type ProductFormProps = {
  onClose: () => void;
  onSave: (product: any) => void;
  formId?: string;
};

export default function AddProductForm({ onClose, onSave, formId = 'product_form' }: ProductFormProps) {
  const [productData, setProductData] = useState({
    sku: '',
    name: '',
    price: '',
    productType: 'DVD',
    category: '',
    description: '',
    size: '',      // for DVD
    weight: '',    // for Book
    height: '',    // for Furniture
    width: '',
    length: '',
    attributes: [] as Attribute[],
  });

  const [newAttribute, setNewAttribute] = useState<Attribute>({
    name: '',
    value: '',
    type: 'text'
  });

  const navigate = useNavigate(); // ✅ Added

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: DOMPurify.sanitize(value)
    }));
  };

  const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAttribute(prev => ({ ...prev, [name]: value }));
  };

  const addAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      const sanitizedAttr = {
        name: DOMPurify.sanitize(newAttribute.name),
        value: DOMPurify.sanitize(newAttribute.value),
        type: newAttribute.type
      };

      setProductData(prev => ({
        ...prev,
        attributes: [...prev.attributes, sanitizedAttr]
      }));

      setNewAttribute({ name: '', value: '', type: 'text' });
    }
  };

  const removeAttribute = (index: number) => {
    setProductData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const newProduct = { ...productData, id: crypto.randomUUID() };

    // ✅ Save directly to localStorage before redirecting
    const existing = localStorage.getItem("addedProducts");
    const updated = existing ? [...JSON.parse(existing), newProduct] : [newProduct];
    localStorage.setItem("addedProducts", JSON.stringify(updated));

// Optional callback for parent
onSave(newProduct);

// ✅ Navigate only *after* onSave completes
navigate("/");

  } catch (error) {
    console.error("Failed to save product:", error);
  }
};



  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          data-testid="close-form-button"
        >
          &times;
        </button>

        <h2>Add New Product</h2>

        <form id={formId} onSubmit={handleSubmit} data-testid="product-form">
          <div className={styles.formGroup}>
            <label htmlFor="sku">SKU:</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={productData.sku}
              onChange={handleChange}
              required
              data-testid="product-sku-input"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name">Product Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={productData.name}
              onChange={handleChange}
              required
              data-testid="product-name-input"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price">Price ($):</label>
            <input
              type="number"
              id="price"
              name="price"
              value={productData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              data-testid="product-price-input"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="productType">Product Type:</label>
            <select
              id="productType"
              name="productType"
              value={productData.productType}
              onChange={handleChange}
              required
              data-testid="product-type-select"
            >
              <option value="DVD" data-testid="product-type-dvd">DVD</option>
              <option value="Book" data-testid="product-type-book">Book</option>
              <option value="Furniture" data-testid="product-type-furniture">Furniture</option>
            </select>
          </div>

          {productData.productType === 'DVD' && (
            <div className={styles.formGroup}>
              <label htmlFor="size">Size (MB):</label>
              <input
                type="number"
                id="size"
                name="size"
                value={productData.size}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {productData.productType === 'Book' && (
            <div className={styles.formGroup}>
              <label htmlFor="weight">Weight (KG):</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={productData.weight}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {productData.productType === 'Furniture' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="height">Height (CM):</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={productData.height}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="width">Width (CM):</label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={productData.width}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="length">Length (CM):</label>
                <input
                  type="number"
                  id="length"
                  name="length"
                  value={productData.length}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={productData.category}
              onChange={handleChange}
              required
              data-testid="product-category-select"
            >
              <option value="" data-testid="product-category-default">Select a category</option>
              <option value="tech" data-testid="product-category-tech">Tech</option>
              <option value="clothes" data-testid="product-category-clothes">Clothes</option>
              <option value="other" data-testid="product-category-other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleChange}
              rows={4}
              required
              data-testid="product-description-textarea"
            />
          </div>

          <div className={styles.formGroup}>
            <h3>Attributes</h3>
            <div className={styles.attributeForm}>
              <input
                type="text"
                placeholder="Attribute name"
                name="name"
                value={newAttribute.name}
                onChange={handleAttributeChange}
                data-testid="attribute-name-input"
              />
              <input
                type="text"
                placeholder="Value"
                name="value"
                value={newAttribute.value}
                onChange={handleAttributeChange}
                data-testid="attribute-value-input"
              />
              <select
                name="type"
                value={newAttribute.type}
                onChange={handleAttributeChange}
                data-testid="attribute-type-select"
              >
                <option value="text">Text</option>
                <option value="color">Color</option>
                <option value="swatch">Swatch</option>
              </select>
              <button
                type="button"
                onClick={addAttribute}
                data-testid="add-attribute-button"
                disabled={!newAttribute.name || !newAttribute.value}
              >
                Add
              </button>
            </div>

            <div className={styles.attributesList}>
              {productData.attributes.map((attr, index) => (
                <div key={`${attr.name}-${attr.value}-${index}`} className={styles.attributeItem}>
                  <span><strong>{attr.name}</strong>: {attr.value} ({attr.type})</span>
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    data-testid={`remove-attribute-${index}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              data-testid="save-product-button"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

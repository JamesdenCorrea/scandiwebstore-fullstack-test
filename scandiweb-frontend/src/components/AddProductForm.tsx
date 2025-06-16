import React, { useState } from 'react';
import styles from './AddProductForm.module.css';
import DOMPurify from 'dompurify';

type Attribute = {
  name: string;
  value: string;
  type: string;
};

type ProductFormProps = {
  onClose: () => void;
  onSave: (product: any) => void;
};

export default function AddProductForm({ onClose, onSave }: ProductFormProps) {
  const [productData, setProductData] = useState({
    sku: '',
    name: '',
    price: '',
    productType: 'simple',
    category: '',
    description: '',
    attributes: [] as Attribute[],
  });

  const [newAttribute, setNewAttribute] = useState<Attribute>({
    name: '',
    value: '',
    type: 'text'
  });

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
      setProductData(prev => ({
        ...prev,
        attributes: [...prev.attributes, newAttribute]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(productData);
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
        
        <form 
          id="product_form" 
          onSubmit={handleSubmit}
          data-testid="product-form"
        >
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
              <option value="simple">Simple</option>
              <option value="configurable">Configurable</option>
              <option value="grouped">Grouped</option>
            </select>
          </div>

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
              <option value="">Select a category</option>
              <option value="tech">Tech</option>
              <option value="clothes">Clothes</option>
              <option value="other">Other</option>
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
              >
                Add
              </button>
            </div>
            
            <div className={styles.attributesList}>
              {productData.attributes.map((attr, index) => (
                <div key={index} className={styles.attributeItem}>
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
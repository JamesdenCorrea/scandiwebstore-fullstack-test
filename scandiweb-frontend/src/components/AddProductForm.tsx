import React, { useState } from 'react';
import styles from './AddProductForm.module.css';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

const ADD_PRODUCT = gql`
  mutation AddProduct($input: ProductInput!) {
    addProduct(input: $input) {
      id
      name
    }
  }
`;

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
    size: '',
    weight: '',
    height: '',
    width: '',
    length: '',
    attributes: [] as Attribute[],
  });

  const [newAttribute, setNewAttribute] = useState<Attribute>({
    name: '',
    value: '',
    type: 'text'
  });

  const navigate = useNavigate();
  const [addProduct] = useMutation(ADD_PRODUCT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: DOMPurify.sanitize(value) }));
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
  const validateProductData = () => {
  const errors: string[] = [];

  if (!productData.sku.trim()) errors.push("SKU is required");
  if (!productData.name.trim()) errors.push("Product name is required");
  if (!productData.price || isNaN(parseFloat(productData.price))) errors.push("Valid price is required");
  if (!productData.category.trim()) errors.push("Category is required");
  if (!productData.description.trim()) errors.push("Description is required");

  // Category-specific validation
  if (productData.productType === "DVD" && !productData.size.trim()) {
    errors.push("Size is required for DVD");
  }
  if (productData.productType === "Book" && !productData.weight.trim()) {
    errors.push("Weight is required for Book");
  }
  if (productData.productType === "Furniture") {
    if (!productData.height.trim() || !productData.width.trim() || !productData.length.trim()) {
      errors.push("Height, width, and length are required for Furniture");
    }
  }

  return errors;
};


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const errors = validateProductData();

  if (errors.length > 0) {
    alert("Please fix the following errors:\n" + errors.join("\n")); // or show in UI
    return; // 💡 prevents mutation or closing
  }

  const newProduct = {
    id: crypto.randomUUID(),
    ...productData,
    price: parseFloat(productData.price),
    attributes: productData.attributes.map(attr => ({
      ...attr,
      value: DOMPurify.sanitize(attr.value)
    }))
  };

  try {
    const { data } = await addProduct({ variables: { input: newProduct } });

    if (data?.addProduct) {
      onSave(newProduct); // ✅ only on success
      navigate('/all');   // ✅ only after valid save
    }
  } catch (error) {
    console.error("Failed to add product:", error);
  }
};


  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <button className={styles.closeButton} onClick={onClose} data-testid="close-form-button">
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
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} data-testid="save-product-button">
              Save Product
            </button>
          </div>
<div
  id="html_injection"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(productData.description || '') }}
  data-testid="html-injection"
/>


        </form>
      </div>
    </div>
  );
}

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import AddProductForm from './AddProductForm';
import { useFormContext } from '../context/FormContext';

const Layout: React.FC = () => {
  const { isFormOpen, closeForm } = useFormContext();
  
  const handleSave = (productData: any) => {
    console.log('Product saved:', productData);
    closeForm();
  };

  return (
    <>
      <Header 
        categories={['All', 'Tech', 'Clothes']}
        activeCategory="All"
        cartItemCount={0}
        onCartClick={() => {}}
      />
      <Outlet />
      {isFormOpen && (
        <AddProductForm 
          onClose={closeForm} 
          onSave={handleSave}
          formId="product_form"
        />
      )}
    </>
  );
};

export default Layout;
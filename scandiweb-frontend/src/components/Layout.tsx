import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <>
      <Header 
        categories={['All', 'Tech', 'Clothes']}
        activeCategory="All"
        cartItemCount={0}
        onCartClick={() => {}}
      />
      <Outlet />
    </>
  );
};

export default Layout;
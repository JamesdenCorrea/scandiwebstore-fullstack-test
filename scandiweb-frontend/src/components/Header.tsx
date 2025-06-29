import React, { useState } from 'react';
import './Header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import { useCurrency } from '../context/CurrencyContext'; // ✅ import currency context


type HeaderProps = {
  categories: string[];
  activeCategory: string;
  cartItemCount: number;
  onCartClick: () => void;
  onCategoryChange?: (category: string) => void;
  title?: string;
};

export default function Header({
  categories,
  activeCategory,
  cartItemCount,
  onCartClick,
  onCategoryChange = () => {},
  title = 'Scandiweb Store',
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { openForm } = useFormContext();

  const { currency, setCurrency } = useCurrency(); // ✅ use currency context
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const handleCategoryClick = (category: string) => {
    const path = category === 'All' ? '/all' : `/${category.toLowerCase()}`;
    navigate(path);
    onCategoryChange(category);
  };

  const handleCurrencySelect = (selected: string) => {
    setCurrency(selected as 'USD' | 'EUR' | 'GBP');
    setShowCurrencyDropdown(false);
  };

  const handleAddClick = () => {
    if (location.pathname !== '/admin') {
      navigate('/admin');
    }
    openForm();
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-container">
          <Link to="/" className="logo" aria-label="Site Logo">
            <svg className="logo-icon" viewBox="0 0 24 24">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18 9v6l-6 3.5-6-3.5V9l6-3.5z" />
              <path d="M12 16l6-3.5V9l-6 3.5L6 9v3.5l6 3.5z" />
            </svg>
            <span className="logo-text">{title}</span>
          </Link>
        </div>

        {/* Category navigation */}
        <nav className="nav-categories" aria-label="Product Categories" data-testid="category-nav">
          <ul className="category-list">
            {categories.map((category) => {
              const href = category === 'All' ? '/all' : `/${category.toLowerCase()}`;
const normalizedPath = location.pathname === '/' ? '/all' : location.pathname;
const isActive = normalizedPath === href;

              return (
                <li key={category}>
                  <Link
                    to={href}
                    data-testid={isActive ? 'active-category-link' : 'category-link'}
                    className={`category-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Category ${category}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right-side actions */}
        <div className="actions-container">
          {/* Add button */}
<button
  onClick={handleAddClick}
  role="link" // 👈 change from "button" to "link"
  aria-label="ADD"
  className="add-product-link"
  data-testid="global-add-button"
>
  <span className="add-icon">➕</span> ADD
</button>


          {/* Currency switcher */}
          <div className="currency-switcher">
            <button
              data-testid="currency-switcher"
              className="currency-button"
              aria-label="Currency switcher"
              aria-haspopup="listbox"
              aria-expanded={showCurrencyDropdown}
              onClick={() => setShowCurrencyDropdown((prev) => !prev)}
            >
              {currency}
              <span className="chevron">{showCurrencyDropdown ? '▲' : '▼'}</span>
            </button>

            {showCurrencyDropdown && (
              <ul
                className="currency-dropdown"
                data-testid="currency-dropdown"
                role="listbox"
                aria-label="Currency options"
              >
                {['USD', 'EUR', 'GBP'].map((cur) => (
                  <li
                    key={cur}
                    data-testid={`currency-option-${cur}`}
                    className="currency-option"
                    role="option"
                    aria-selected={currency === cur}
                    onClick={() => handleCurrencySelect(cur)}
                  >
                    {cur === 'USD' ? '$ USD' : cur === 'EUR' ? '€ EUR' : '£ GBP'}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cart button */}
          <div className="cart-container">
            <button
              className="cart-button"
              data-testid="cart-btn"
              onClick={onCartClick}
              aria-label={`Cart with ${cartItemCount} items`}
              type="button"
            >
              <svg className="cart-icon" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartItemCount > 0 && (
                <span className="cart-count" aria-live="polite">
                  {cartItemCount === 1 ? '1 item' : `${cartItemCount} items`}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import './Header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const handleCategoryClick = (category: string) => {
    const path = category === 'All' ? '/all' : `/${category.toLowerCase()}`;
    navigate(path);
    onCategoryChange(category);
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    setShowCurrencyDropdown(false);
  };

  return (
    <header className="header" role="banner" style={{ position: 'relative', zIndex: 100 }}>
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

        {/* Categories nav */}
        <nav className="nav-categories" aria-label="Product Categories" data-testid="category-nav">
          <ul className="category-list">
            {categories.map((category) => {
              const href = category === 'All' ? '/all' : `/${category.toLowerCase()}`;
              const isActive = location.pathname === href;

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

        {/* Currency switcher */}
        <div className="currency-switcher" style={{ position: 'relative', marginRight: '1rem', zIndex: 105 }}>
          <button
            data-testid="currency-switcher"
            aria-label="Currency switcher"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            style={{ padding: '0.5rem', border: '1px solid #ccc', background: 'white' }}
          >
            {selectedCurrency}
          </button>

          {showCurrencyDropdown && (
            <ul
              data-testid="currency-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                border: '1px solid #ccc',
                padding: '0.25rem',
                marginTop: '0.25rem',
                listStyle: 'none',
                zIndex: 110,
              }}
            >
              {['USD', 'EUR', 'GBP'].map((currency) => (
                <li
                  key={currency}
                  data-testid={`currency-option-${currency}`}
                  onClick={() => handleCurrencySelect(currency)}
                  style={{ padding: '0.25rem', cursor: 'pointer' }}
                >
                  {currency === 'USD' ? '$ USD' : currency === 'EUR' ? '€ EUR' : '£ GBP'}
                </li>
              ))}
            </ul>
          )}

          {/* ✅ Always render this outside the dropdown */}
          <span data-testid="active-currency" style={{ marginLeft: '0.5rem' }}>
            {selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : '£'}
          </span>
        </div>

        {/* Cart button */}
        <div className="cart-container">
          <button
            className="cart-button"
            data-testid="cart-btn"
            onClick={onCartClick}
            aria-label={`Cart with ${cartItemCount} items`}
            type="button"
            style={{ position: 'relative', zIndex: 101 }}
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
    </header>
  );
}

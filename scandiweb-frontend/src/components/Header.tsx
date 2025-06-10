
import './Header.css';

type HeaderProps = {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  cartItemCount: number;
  onCartClick: () => void;
  title?: string;
};

export default function Header({
  categories,
  activeCategory,
  onCategoryChange,
  cartItemCount,
  onCartClick,
  title = 'ScandiShop',
}: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="header-container">
        {/* Logo/Brand */}
        <div className="logo-container">
          <div className="logo" aria-label="Site Logo">
            <svg className="logo-icon" viewBox="0 0 24 24">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18 9v6l-6 3.5-6-3.5V9l6-3.5z" />
              <path d="M12 16l6-3.5V9l-6 3.5L6 9v3.5l6 3.5z" />
            </svg>
            <span className="logo-text">{title}</span>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="nav-categories" aria-label="Product Categories">
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category}>
                <button
                  data-testid={
                    activeCategory === category
                      ? 'active-category-link'
                      : 'category-link'
                  }
                  className={`category-link ${
                    activeCategory === category ? 'active' : ''
                  }`}
                  onClick={() => onCategoryChange(category)}
                  aria-current={activeCategory === category ? 'page' : undefined}
                  aria-label={`Category ${category}`}
                  type="button"
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Cart Button */}
        <div className="cart-container">
          <button
            className="cart-button"
            data-testid="cart-btn"
            onClick={onCartClick}
            aria-label={`Cart with ${cartItemCount} items`}
            type="button"
          >
            <svg
              className="cart-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-count" aria-live="polite">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
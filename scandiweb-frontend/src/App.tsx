
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

import CategoryListingPage from './pages/CategoryListingPage';
import ProductDetails from './pages/ProductDetails'; // import product page

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CategoryListingPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          {/* other routes */}
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

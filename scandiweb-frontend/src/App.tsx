import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import CategoryListingPage from './pages/CategoryListingPage';
import ProductDetails from './pages/ProductDetails';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route element={<Layout />} >
            <Route path="/" element={<Navigate to="/all" />} />
            <Route path="/all" element={<CategoryListingPage />} />
            <Route path="/tech" element={<CategoryListingPage />} />
            <Route path="/consoles" element={<CategoryListingPage />} />
            <Route path="/computers" element={<CategoryListingPage />} />
            <Route path="/phones" element={<CategoryListingPage />} />
            <Route path="/accessories" element={<CategoryListingPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/:category?" element={<CategoryListingPage />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

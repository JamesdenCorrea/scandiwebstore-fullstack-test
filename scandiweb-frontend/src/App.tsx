import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import CategoryListingPage from './pages/CategoryListingPage';
import ProductDetails from './pages/ProductDetails';
import AdminPanel from './pages/AdminPanel'; // Add this import

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route element={<Layout />} >
            <Route path="/" element={<Navigate to="/all" />} />
            <Route path="/all" element={<CategoryListingPage />} />
            <Route path="/tech" element={<CategoryListingPage />} />
            <Route path="/clothes" element={<CategoryListingPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/admin" element={<AdminPanel />} /> {/* Add this route */}
            <Route path="*" element={<Navigate to="/all" />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
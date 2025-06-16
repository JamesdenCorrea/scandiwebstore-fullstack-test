import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import CategoryListingPage from './pages/CategoryListingPage';
import ProductDetails from './pages/ProductDetails';
import AdminPanel from './pages/AdminPanel';
import { FormProvider } from './context/FormContext'; // Add this

function App() {
  return (
    <FormProvider> {/* Wrap with FormProvider */}
      <CartProvider>
        <Router>
          <Routes>
            <Route element={<Layout />} >
              <Route path="/" element={<Navigate to="/all" />} />
              <Route path="/all" element={<CategoryListingPage />} />
              <Route path="/tech" element={<CategoryListingPage />} />
              <Route path="/clothes" element={<CategoryListingPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<Navigate to="/all" />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </FormProvider>
  );
}

export default App;
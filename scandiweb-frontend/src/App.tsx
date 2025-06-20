import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { FormProvider } from './context/FormContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Layout from './components/Layout';
import CategoryListingPage from './pages/CategoryListingPage';
import ProductDetails from './pages/ProductDetails';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <CurrencyProvider>
      <FormProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                {/* ✅ Route root path to AdminPanel as required by Playwright tests */}
                <Route path="/" element={<AdminPanel />} />

                {/* Product listings */}
                <Route path="/all" element={<CategoryListingPage />} />
                <Route path="/product-list" element={<CategoryListingPage />} />
                <Route path="/tech" element={<CategoryListingPage />} />
                <Route path="/clothes" element={<CategoryListingPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />

                {/* Optional: Admin route if you still want it separately */}
                <Route path="/admin" element={<AdminPanel />} />

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/" />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </FormProvider>
    </CurrencyProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { FormProvider } from './context/FormContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Layout from './components/Layout';
import CategoryListingPage from './pages/CategoryListingPage';
import ProductDetails from './pages/ProductDetails';
import AdminPanel from './pages/AdminPanel';
import ProductList from './pages/ProductList';

function App() {
  return (
    <CurrencyProvider>
      <FormProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/all" />} />
                <Route path="/all" element={<CategoryListingPage />} />
                <Route path="/tech" element={<CategoryListingPage />} />
                <Route path="/clothes" element={<CategoryListingPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/product-list" element={<ProductList />} />
                <Route path="*" element={<Navigate to="/all" />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </FormProvider>
    </CurrencyProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Capture from './pages/Capture';
import Query from './pages/Query';
import Layout from './pages/Layout';
import Traceability from './pages/Traceability';
import Product from './pages/Product';
import ProtectedRoutes from './protectedRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoutes />}>
          <Route path="/app" element={<Layout />}>
            <Route index element={<Query />} />
            <Route path="query" element={<Query />} />
            <Route path="capture" element={<Capture />} />
            <Route path="traceability" element={<Traceability />} />
          </Route>
          <Route path="*" element={<Layout />} />
          <Route path="/" element={<Layout />} />
        </Route>
        <Route path="/product" element={<Product />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

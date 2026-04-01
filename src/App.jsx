import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Portfolio from './pages/Portfolio';
import Post from './pages/Post';
import OfficialChannels from './pages/OfficialChannels';
import SearchResults from './pages/SearchResults';

// Admin Dashboard Components & Pages
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AdminLeads from './pages/dashboard/Leads';
import AdminProducts from './pages/dashboard/Products';
import AdminProductForm from './pages/dashboard/ProductForm';
import AdminPosts from './pages/dashboard/Posts';
import AdminPostForm from './pages/dashboard/PostForm';
import AdminLogin from './pages/dashboard/Login';

const PublicLayout = () => {
  return (
    <div className="relative flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Routes>
        {/* Public Application Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/official-channels" element={<OfficialChannels />} />
          <Route path="/search" element={<SearchResults />} />
        </Route>

        {/* Admin Routes — Wrapped with AuthProvider */}
        <Route element={<AuthProvider><Outlet /></AuthProvider>}>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="posts/new" element={<AdminPostForm />} />
            <Route path="posts/edit/:id" element={<AdminPostForm />} />
          </Route>
        </Route>
      </Routes>
    </LanguageProvider>
  );
}

export default App;

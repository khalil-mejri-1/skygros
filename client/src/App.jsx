import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";

import Footer from "./components/Footer";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Panier from "./pages/Panier.jsx";
import Historique from "./pages/Historique.jsx";
import Admin from "./pages/Admin.jsx";
import GlobalNotifications from "./components/GlobalNotifications.jsx";
import TwoFAVerify from "./pages/TwoFAVerify.jsx";
import TwoFASetup from "./pages/TwoFASetup.jsx";
import Demos from "./pages/Demos.jsx";
import TwoFAEnforcer from "./components/TwoFAEnforcer.jsx";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <GlobalNotifications />
      <TwoFAEnforcer />
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:categoryId" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="/historique" element={<Historique />} />
        <Route path="/demos" element={user ? <Demos /> : <Navigate to="/login" />} />
        <Route path="/2fa-setup" element={user ? <TwoFASetup /> : <Navigate to="/login" />} />
        <Route path="/2fa-verify" element={<TwoFAVerify />} />
        <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Navigate to="/" />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

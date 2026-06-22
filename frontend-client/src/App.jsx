import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import OTPVerify from "./pages/auth/OTPVerify";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TrackOrder from "./pages/orders/TrackOrder";
import Shop from "./pages/shop/Shop";
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/cart/Checkout";
import PaymentCallback from "./pages/cart/PaymentCallback";
import Dashboard from "./pages/dashboard/Dashboard";
import VerifyIdentity from "./pages/dashboard/VerifyIdentity";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-otp" element={<OTPVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Full catalog, cart and checkout require sign-in — landing page only shows a teaser */}
            <Route element={<ProtectedRoute />}>
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/verify-identity" element={<VerifyIdentity />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

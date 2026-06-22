import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, SuperAdminRoute } from "./components/guards";

import Login from "./pages/auth/Login";
import AccessDenied from "./pages/auth/AccessDenied";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import Verifications from "./pages/identity/Verifications";
import Admins from "./pages/superadmin/Admins";
import Clients from "./pages/superadmin/Clients";
import Profile from "./pages/profile/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/verifications" element={<Verifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<SuperAdminRoute />}>
            <Route path="/admins" element={<Admins />} />
            <Route path="/clients" element={<Clients />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

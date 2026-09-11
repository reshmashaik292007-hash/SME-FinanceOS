import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { LangProvider } from "./context/LangContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Invoices from "./pages/Invoices";
import Expenses from "./pages/Expenses";
import CashFlow from "./pages/CashFlow";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import ToastContainer from "./components/Toast";
import { useToast } from "./hooks/useToast";

function AppRoutes() {
  const { user, onboarded } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/onboarding" element={
          !user ? <Navigate to="/register" replace /> :
          onboarded ? <Navigate to="/dashboard" replace /> :
          <Onboarding />
        } />

        {/* Protected app routes */}
        <Route element={
          !user ? <Navigate to="/login" replace /> : <Layout addToast={addToast} />
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents"    element={<Agents addToast={addToast} />} />
          <Route path="/invoices"  element={<Invoices addToast={addToast} />} />
          <Route path="/expenses"  element={<Expenses addToast={addToast} />} />
          <Route path="/cash-flow" element={<CashFlow />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
      <ToastContainer toasts={toasts} remove={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <DataProvider>
            <div className="size-full">
              <AppRoutes />
            </div>
          </DataProvider>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

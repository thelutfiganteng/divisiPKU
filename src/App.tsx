
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Index from "./pages/Index";
import AdminLayout from "./components/layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Inventory from "./pages/admin/Inventory";
import AddAsset from "./pages/admin/AddAsset";
import Users from "./pages/admin/Users";
import RegisterUser from "./pages/admin/RegisterUser";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { createDummyAccounts } from "./utils/createDummyAccounts";

// Create the QueryClient outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  // Create dummy accounts when the app loads
  useEffect(() => {
    createDummyAccounts();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <>
                      <Header />
                      <Index />
                    </>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard-admin" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/add-asset" element={<AddAsset />} />
                <Route path="/users" element={<Users />} />
                <Route path="/register-user" element={<RegisterUser />} />
              </Route>
              <Route path="/admin" element={<Navigate to="/dashboard-admin" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

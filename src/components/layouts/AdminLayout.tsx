
import React from "react";
import { Toaster } from "sonner";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";

const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admin users
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex h-[calc(100vh-64px)]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
          <Toaster />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  Database,
  FilePlus,
  Package,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  hasChildren?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  path, 
  isActive, 
  hasChildren = false,
  isOpen = false,
  onClick
}) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        isActive 
          ? "bg-[#172a46] text-white" 
          : "text-gray-300 hover:bg-[#172a46]/60 hover:text-white"
      )}
      onClick={onClick}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
      <span className="flex-1">{label}</span>
      {hasChildren && (
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform", 
            isOpen ? "transform rotate-180" : ""
          )} 
        />
      )}
    </Link>
  );
};

const SubNavItem: React.FC<Omit<NavItemProps, 'hasChildren' | 'isOpen' | 'onClick'>> = ({ 
  icon, 
  label, 
  path, 
  isActive 
}) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 pl-10 py-2 rounded-md text-sm transition-colors",
        isActive 
          ? "bg-[#172a46] text-white" 
          : "text-gray-300 hover:bg-[#172a46]/60 hover:text-white"
      )}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([
    "inventory-management",
    "user-management"
  ]);

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId) 
        : [...prev, menuId]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isMenuActive = (paths: string[]) => paths.some(path => location.pathname.includes(path));

  return (
    <aside className="w-64 bg-[#0a192f] text-white shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
      </div>
      <nav className="p-2 space-y-1">
        <NavItem 
          icon={<BarChart3 size={18} />} 
          label="Dashboard" 
          path="/dashboard-admin" 
          isActive={isActive("/dashboard-admin")} 
        />
        
        {/* Inventory Management Section */}
        <NavItem 
          icon={<Package size={18} />} 
          label="Inventory Management" 
          path="#" 
          isActive={isMenuActive(["/inventory", "/add-asset"])} 
          hasChildren
          isOpen={openMenus.includes("inventory-management")}
          onClick={() => toggleMenu("inventory-management")}
        />
        
        {openMenus.includes("inventory-management") && (
          <div className="ml-2 space-y-1 mt-1 border-l-2 border-gray-800">
            <SubNavItem 
              icon={<Database size={16} />} 
              label="View Inventory" 
              path="/inventory" 
              isActive={isActive("/inventory")} 
            />
            <SubNavItem 
              icon={<FilePlus size={16} />} 
              label="Add New Asset" 
              path="/add-asset" 
              isActive={isActive("/add-asset")} 
            />
          </div>
        )}

        {/* User Management Section */}
        <NavItem 
          icon={<Users size={18} />} 
          label="User Management" 
          path="#" 
          isActive={isMenuActive(["/users", "/register-user"])} 
          hasChildren
          isOpen={openMenus.includes("user-management")}
          onClick={() => toggleMenu("user-management")}
        />
        
        {openMenus.includes("user-management") && (
          <div className="ml-2 space-y-1 mt-1 border-l-2 border-gray-800">
            <SubNavItem 
              icon={<Users size={16} />} 
              label="View Users" 
              path="/users" 
              isActive={isActive("/users")} 
            />
            <SubNavItem 
              icon={<UserPlus size={16} />} 
              label="Register User" 
              path="/register-user" 
              isActive={isActive("/register-user")} 
            />
          </div>
        )}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

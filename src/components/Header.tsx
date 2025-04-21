
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Database, Package2, UserCog } from "lucide-react";

const Header = () => {
  const { signOut, user, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-[#0a192f] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <Package2 className="mr-2 h-6 w-6" />
          PLN UPDL Palembang
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link 
              to="/dashboard-admin"
              className="flex items-center gap-1 text-sm text-white hover:text-yellow-300 transition-colors"
            >
              <UserCog className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}
          <span className="hidden md:flex items-center gap-2">
            <Database className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-300">
              {user.email} {isAdmin && <span className="bg-yellow-500 text-[#0a192f] px-2 py-0.5 rounded-full text-xs font-medium ml-1">Admin</span>}
            </span>
          </span>
          <Button
            variant="outline"
            onClick={signOut}
            className="text-black border-white hover:bg-[#FFF574] hover:text-white"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

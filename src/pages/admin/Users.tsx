
import { useEffect } from "react";
import UserManagement from "@/components/admin/UserManagement";

const Users = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#0a192f]">User Management</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <UserManagement />
      </div>
    </div>
  );
};

export default Users;

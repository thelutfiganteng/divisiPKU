
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, Shield, UserX, RefreshCw, User, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

type UserRole = "admin" | "user";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
  username?: string | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToRoleChange, setUserToRoleChange] = useState<{id: string, role: UserRole} | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch users using a different approach that doesn't require admin API
  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // First, get the roles from the user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (roleError) {
        throw roleError;
      }
      
      // Then get user profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, created_at');
        
      if (profileError) {
        throw profileError;
      }
      
      // Combine the data to create user list
      const combinedUsers: UserWithRole[] = [];
      
      if (roleData && profileData) {
        // Map profiles to roles
        profileData.forEach(profile => {
          const userRole = roleData.find(r => r.user_id === profile.id);
          if (userRole) {
            combinedUsers.push({
              id: profile.id,
              email: profile.username || 'No email',
              created_at: profile.created_at,
              role: userRole.role as UserRole || 'user',
              username: profile.username
            });
          }
        });
      }
      
      setUsers(combinedUsers);
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setErrorMessage(`Failed to load user data: ${error.message}`);
      toast({
        title: 'Error',
        description: `Failed to load user data: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserRole = async () => {
    if (!userToRoleChange) return;
    
    try {
      const newRole: UserRole = userToRoleChange.role === 'admin' ? 'user' : 'admin';
      
      // Update role in database
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userToRoleChange.id);

      if (error) throw error;

      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userToRoleChange.id 
            ? { ...user, role: newRole } 
            : user
        )
      );

      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setUserToRoleChange(null);
      setShowRoleDialog(false);
    }
  };

  const confirmRoleChange = (id: string, currentRole: UserRole) => {
    setUserToRoleChange({ id, role: currentRole });
    setShowRoleDialog(true);
  };

  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setShowDeleteDialog(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Delete the user's roles and profile instead of using admin API
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userToDelete);
      
      if (roleError) {
        throw roleError;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete);
      
      if (profileError) {
        throw profileError;
      }
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userToDelete));
      
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setUserToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <Link to="/register-user">
            <Button className="flex gap-2 items-center">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </Link>
          <Button 
            onClick={fetchUsers} 
            variant="outline" 
            className="flex gap-2 items-center"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-4 rounded-md">
          <p className="font-medium">Error</p>
          <p>{errorMessage}</p>
          <p className="text-sm mt-2">
            Note: This may be due to permission issues. Make sure you are logged in as an admin.
          </p>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username/Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {user.username || user.email}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className={`${user.role === 'admin' ? 'bg-yellow-500' : 'bg-gray-200 text-gray-800'}`}
                    >
                      {user.role === 'admin' ? (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>Admin</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>User</span>
                        </div>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => confirmRoleChange(user.id, user.role)}
                        className="h-8 px-2 text-xs"
                      >
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(user.id)}
                        className="h-8 px-2 text-xs"
                      >
                        <UserX className="h-3 w-3 mr-1" /> 
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Role Change Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              {userToRoleChange?.role === 'admin'
                ? "Are you sure you want to remove admin privileges from this user?"
                : "Are you sure you want to make this user an admin?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToRoleChange(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggleUserRole}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;

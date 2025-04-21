
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User } from "lucide-react";

const RegisterUser = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");

  // Email validation function
  const isValidEmail = (email: string) => {
    // Basic email regex that ensures proper format including domain validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error("Only admins can register new users");
      return;
    }
    
    if (!email || !password || !role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the user directly in the database using Supabase Auth
      const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email to bypass verification
        user_metadata: {
          full_name: fullName
        }
      });
      
      if (signUpError) throw signUpError;
      if (!userData.user) throw new Error("Failed to create user");
      
      // Set the user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: userData.user.id, 
          role 
        }]);
        
      if (roleError) {
        // If there's an error setting the role, continue but log the error
        console.error('Error setting user role:', roleError);
        toast.warning(`User created but there was an issue setting the role: ${roleError.message}`);
      } else {
        toast.success(`User ${email} registered successfully as ${role}`);
      }
      
      // Create user profile if fullName is provided
      if (fullName) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userData.user.id, 
            username: fullName 
          }]);
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // We don't need to show this error to the user as it's not critical
        }
      }
      
      // Navigate to the users management page
      navigate('/users');
      
    } catch (error: any) {
      console.error('Error registering user:', error);
      toast.error(`Failed to register user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#0a192f]">Register New User</h1>
      
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Account</CardTitle>
            <CardDescription>Register a new user or admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user" className="flex items-center">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="flex items-center">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#FFF574] hover:bg-[#FFF574]"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Register New Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterUser;

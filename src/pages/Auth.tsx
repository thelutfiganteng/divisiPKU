
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Package2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      // Redirect based on user role
      checkUserRole(user.id);
    }
  }, [user, navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Redirect based on role
      if (data && data.length > 0 && data.some(role => role.role === 'admin')) {
        navigate("/dashboard-admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      navigate("/"); // Default redirect if role check fails
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login successful!");
        // Redirect will be handled by useEffect
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign in");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      const { error, data } = await signUp(email, password);
      
      if (error) {
        toast.error(error.message);
        return;
      }

      // If signup is successful, create user role record
      if (data?.user) {
        try {
          // Insert the user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: selectedRole
            });
          
          if (roleError) {
            console.error("Error setting user role:", roleError);
            toast.error(`Error setting user role: ${roleError.message}`);
            return;
          }
          
          // Update profile with full name
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
              id: data.user.id, 
              username: fullName || email.split('@')[0]
            });
          
          if (profileError) {
            console.error("Error creating profile:", profileError);
            toast.error(`Error creating profile: ${profileError.message}`);
            return;
          }
          
          toast.success("Registration successful! Please check your email to verify your account.");
          
          // Sign in the user automatically after successful registration
          const { error: signInError } = await signIn(email, password);
          
          if (signInError) {
            toast.error(`Error signing in after registration: ${signInError.message}`);
            return;
          }
          
          // Redirect based on role will be handled by the signIn function
        } catch (insertError: any) {
          toast.error(insertError.message || "Error setting user data");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 bg-[#FFF574] text-black rounded-t-lg">
            <div className="flex items-center justify-center gap-2">
              <Package2 className="h-6 w-6" />
              <CardTitle className="text-2xl font-bold text-center">PLN UPDL Palembang</CardTitle>
            </div>
            <CardDescription className="text-black-300 text-center">
              Inventory Management System Bagian PKU
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-4">
                  {/* Demo Credentials Notice */}
                  {/* <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                    <p className="font-medium text-blue-800 mb-1">Demo Credentials:</p>
                    <p className="text-blue-700">Admin: admin@gmail.com / admin1234</p>
                    <p className="text-blue-700">User: user@example.com / user1234</p>
                  </div> */}
                
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#FFF574] hover:bg-[#FFF574]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Select Role</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => setSelectedRole(value)}
                    >
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        {/* <SelectItem value="admin">Admin</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#FFF574] hover:bg-[#FFF574]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

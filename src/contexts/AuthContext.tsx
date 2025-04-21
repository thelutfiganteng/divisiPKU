
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        if (currentSession?.user) {
          setTimeout(() => {
            checkAdminStatus(currentSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        checkAdminStatus(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        const isUserAdmin = data.some(role => role.role === 'admin');
        setIsAdmin(isUserAdmin);
        console.log("Admin check:", isUserAdmin, data);
      } else {
        console.log("No role data found");
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signUp({
      email,
      password,
    });
    setIsLoading(false);
    return response;
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    
    if (!response.error && response.data.user) {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', response.data.user.id);
        
        if (error) {
          console.error("Error fetching user role:", error);
          toast.error("Error checking user role");
          return response;
        }

        if (data && data.length > 0) {
          const isUserAdmin = data.some(role => role.role === 'admin');
          if (isUserAdmin) {
            navigate('/dashboard-admin');
          } else {
            navigate('/'); // Changed from /dashboard-user to /
          }
        } else {
          console.log("No roles found for user");
          navigate('/'); // Changed from /dashboard-user to /
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    }
    
    return response;
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    navigate('/auth');
    setIsLoading(false);
  };

  const value = {
    session,
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

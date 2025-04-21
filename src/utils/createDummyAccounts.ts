
import { supabase } from "@/integrations/supabase/client";

export const createDummyAccounts = async () => {
  console.info("Creating dummy accounts...");
  
  try {
    // Create admin account
    try {
      console.info("Creating admin account...");
      
      // First check if admin already exists
      const { data: existingAdmin, error: checkAdminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1);
        
      if (checkAdminError) {
        console.error("Error checking admin:", checkAdminError);
      }
      
      // Only create admin if doesn't exist
      if (!existingAdmin || existingAdmin.length === 0) {
        const { data: adminUserData, error: adminError } = await supabase.auth.signUp({
          email: 'admin@gmail.com',
          password: 'admin1234',
        });
        
        if (adminError) {
          console.error("Error creating admin account:", adminError);
        } else if (adminUserData.user) {
          // Set admin role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ user_id: adminUserData.user.id, role: 'admin' }]);
          
          if (roleError) {
            console.error("Error setting admin role:", roleError);
          } else {
            console.info("Admin account created successfully");
          }
        }
      } else {
        console.info("Admin account already exists");
      }
    } catch (error) {
      console.error("Error creating admin account:", error);
    }
    
    // Create user account
    try {
      console.info("Creating user account...");
      
      // First check if user already exists
      const { data: existingUser, error: checkUserError } = await supabase.auth
        .signInWithPassword({
          email: 'user@gmail.com',
          password: 'user1234',
        });
        
      if (checkUserError && checkUserError.message !== "Invalid login credentials") {
        console.error("Error checking user:", checkUserError);
      }
      
      // Only create user if doesn't exist
      if (!existingUser || !existingUser.user) {
        const { data: userData, error: userError } = await supabase.auth.signUp({
          email: 'user@gmail.com',
          password: 'user1234',
        });
        
        if (userError) {
          console.error("Error creating user account:", userError);
        } else if (userData.user) {
          // Set user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{ user_id: userData.user.id, role: 'user' }]);
          
          if (roleError) {
            console.error("Error setting user role:", roleError);
          } else {
            console.info("User account created successfully");
          }
        }
      } else {
        console.info("User account already exists");
      }
    } catch (error) {
      console.error("Error creating user account:", error);
    }
  } catch (error) {
    console.error("Error in createDummyAccounts:", error);
  }
  
  console.info("Dummy accounts setup completed");
};

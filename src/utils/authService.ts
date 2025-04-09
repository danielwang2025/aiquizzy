
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/quiz";

// Send OTP code via SMS for phone authentication
export const sendPhoneOTP = async (phone?: string): Promise<void> => {
  if (!phone) {
    throw new Error("手机号码必填");
  }
  
  const { error } = await supabase.auth.signInWithOtp({
    phone: phone
  });
  
  if (error) {
    console.error("Phone OTP error:", error);
    throw new Error(error.message);
  }
};

// Send OTP code via email for email authentication
export const sendEmailOTP = async (email?: string): Promise<void> => {
  if (!email) {
    throw new Error("邮箱地址必填");
  }
  
  const { error } = await supabase.auth.signInWithOtp({
    email: email
  });
  
  if (error) {
    console.error("Email OTP error:", error);
    throw new Error(error.message);
  }
};

// Verify OTP code
export const verifyOTP = async (email?: string, otpCode?: string): Promise<User> => {
  if (!email || !otpCode) {
    throw new Error("邮箱和验证码必填");
  }
  
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otpCode,
    type: 'email'
  });
  
  if (error) {
    console.error("OTP verification error:", error);
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error("验证失败");
  }
  
  return mapSupabaseUser(data.user);
};

// Register new user
export const registerUser = async (email?: string, password?: string, displayName?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error("邮箱和密码必填");
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0]
      }
    }
  });
  
  if (error) {
    console.error("Registration error:", error);
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error("注册失败");
  }
  
  return mapSupabaseUser(data.user);
};

// Login user
export const loginUser = async (email?: string, password?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error("邮箱和密码必填");
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error("Login error:", error);
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error("登录失败");
  }
  
  return mapSupabaseUser(data.user);
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    return null;
  }
  
  // Get profile data
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  return mapSupabaseUser(data.user, profileData);
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Logout error:", error);
    throw new Error(error.message);
  }
};

// Update user profile
export const updateUserProfile = async (displayName?: string): Promise<User> => {
  if (!displayName) {
    throw new Error("显示名称必填");
  }
  
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("未登录");
  }
  
  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({ 
      display_name: displayName,
      updated_at: new Date().toISOString()
    })
    .eq('id', userData.user.id);
  
  if (error) {
    console.error("Profile update error:", error);
    throw new Error(error.message);
  }
  
  // Get updated profile data
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();
  
  return mapSupabaseUser(userData.user, profileData);
};

// Request password reset
export const requestPasswordReset = async (email?: string): Promise<void> => {
  if (!email) {
    throw new Error("邮箱地址必填");
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    console.error("Password reset request error:", error);
    throw new Error(error.message);
  }
};

// Update user password
export const updateUserPassword = async (password?: string): Promise<void> => {
  if (!password) {
    throw new Error("新密码必填");
  }
  
  const { error } = await supabase.auth.updateUser({
    password: password
  });
  
  if (error) {
    console.error("Password update error:", error);
    throw new Error(error.message);
  }
};

// Helper function to map Supabase user to app User type
const mapSupabaseUser = (supabaseUser: any, profile?: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: profile?.display_name || supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'Guest User',
    createdAt: supabaseUser.created_at || profile?.created_at || new Date().toISOString()
  };
};

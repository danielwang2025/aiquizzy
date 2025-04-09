
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/quiz";

// 常见错误消息映射表
const ERROR_MAPPINGS: Record<string, string> = {
  "Email not confirmed": "邮箱未验证，请检查您的邮箱并完成验证",
  "Invalid login credentials": "邮箱或密码错误",
  "User already registered": "此邮箱已被注册",
  "Password should be at least 6 characters": "密码长度至少需要6个字符",
};

// 处理并返回用户友好的错误消息
const handleAuthError = (error: any): Error => {
  console.error("Auth error:", error);
  
  const errorMessage = error?.message || "操作失败";
  const friendlyMessage = ERROR_MAPPINGS[errorMessage] || errorMessage;
  
  return new Error(friendlyMessage);
};

// Send OTP code via SMS for phone authentication
export const sendPhoneOTP = async (phone?: string): Promise<void> => {
  if (!phone) {
    throw new Error("手机号码必填");
  }
  
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone
    });
    
    if (error) {
      throw handleAuthError(error);
    }
  } catch (error) {
    throw handleAuthError(error);
  }
};

// Send OTP code via email for email authentication
export const sendEmailOTP = async (email?: string): Promise<void> => {
  if (!email) {
    throw new Error("邮箱地址必填");
  }
  
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback" 
      }
    });
    
    if (error) {
      throw handleAuthError(error);
    }
  } catch (error) {
    throw handleAuthError(error);
  }
};

// Verify OTP code
export const verifyOTP = async (email?: string, otpCode?: string): Promise<User> => {
  if (!email || !otpCode) {
    throw new Error("邮箱和验证码必填");
  }
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email'
    });
    
    if (error) {
      throw handleAuthError(error);
    }
    
    if (!data.user) {
      throw new Error("验证失败");
    }
    
    return mapSupabaseUser(data.user);
  } catch (error) {
    throw handleAuthError(error);
  }
};

// Register new user
export const registerUser = async (email?: string, password?: string, displayName?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error("邮箱和密码必填");
  }
  
  console.log("注册用户:", email);
  
  try {
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
      throw handleAuthError(error);
    }
    
    if (!data.user) {
      throw new Error("注册失败");
    }
    
    console.log("注册成功:", data.user);
    
    // 检查是否需要验证邮箱
    if (data.session === null) {
      console.log("需要验证邮箱，请检查邮箱完成注册");
      throw new Error("请检查您的邮箱并点击验证链接以完成注册");
    }
    
    return mapSupabaseUser(data.user);
  } catch (error) {
    throw handleAuthError(error);
  }
};

// Login user
export const loginUser = async (email?: string, password?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error("邮箱和密码必填");
  }
  
  console.log("尝试登录:", email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw handleAuthError(error);
    }
    
    if (!data || !data.user) {
      throw new Error("登录失败");
    }
    
    console.log("登录成功:", data.user);
    return mapSupabaseUser(data.user);
  } catch (error) {
    throw handleAuthError(error);
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    
    if (!data.user) {
      return null;
    }
    
    try {
      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      return mapSupabaseUser(data.user, profileData);
    } catch (error) {
      console.error("获取个人资料失败:", error);
      return mapSupabaseUser(data.user);
    }
  } catch (error) {
    console.error("获取当前用户失败:", error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error("身份验证检查失败:", error);
    return false;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw handleAuthError(error);
  }
};

// Update user profile
export const updateUserProfile = async (displayName?: string): Promise<User> => {
  if (!displayName) {
    throw new Error("显示名称必填");
  }
  
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error("未登录");
    }
    
    // 更新 Supabase Auth 中的用户元数据
    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    });
    
    if (authUpdateError) {
      throw handleAuthError(authUpdateError);
    }
    
    // 更新 profiles 表中的信息
    const { error } = await supabase
      .from('profiles')
      .update({ 
        display_name: displayName,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.user.id);
    
    if (error) {
      throw handleAuthError(error);
    }
    
    // 获取更新后的用户资料
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
    
    return mapSupabaseUser(userData.user, profileData);
  } catch (error) {
    throw handleAuthError(error);
  }
};

// Request password reset
export const requestPasswordReset = async (email?: string): Promise<void> => {
  if (!email) {
    throw new Error("邮箱地址必填");
  }
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: window.location.origin + "/reset-password" }
    );
    
    if (error) {
      throw handleAuthError(error);
    }
  } catch (error) {
    throw handleAuthError(error);
  }
};

// Update user password
export const updateUserPassword = async (password?: string): Promise<void> => {
  if (!password) {
    throw new Error("新密码必填");
  }
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    if (error) {
      throw handleAuthError(error);
    }
  } catch (error) {
    throw handleAuthError(error);
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

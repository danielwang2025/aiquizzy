
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/quiz";

// 常见错误消息映射表
const ERROR_MAPPINGS: Record<string, string> = {
  "Email not confirmed": "邮箱未验证，请检查您的邮箱并完成验证",
  "Invalid login credentials": "邮箱或密码错误",
  "User already registered": "此邮箱已被注册",
  "Password should be at least 6 characters": "密码长度至少需要6个字符",
  "For security purposes, you can only request this once every 60 seconds": "出于安全考虑，您每60秒只能请求一次",
  "Error sending magic link": "发送魔术链接时出错，请稍后再试",
};

// 处理并返回用户友好的错误消息
const handleAuthError = (error: any): Error => {
  console.error("Auth error details:", error);
  
  const errorMessage = error?.message || "操作失败";
  const friendlyMessage = ERROR_MAPPINGS[errorMessage] || errorMessage;
  
  return new Error(friendlyMessage);
};

// Send Magic Link for passwordless login
export const sendMagicLink = async (email?: string): Promise<void> => {
  if (!email) {
    throw new Error("邮箱地址必填");
  }
  
  try {
    console.log("Sending magic link to:", email);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error("Magic link error:", error);
      throw handleAuthError(error);
    }
    
    console.log("Magic link sent successfully");
  } catch (error) {
    throw handleAuthError(error);
  }
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

// 使用邮箱 OTP 注册（Magic Link 登录）
export const registerUser = async (email?: string, _password?: string, displayName?: string): Promise<void> => {
  if (!email) {
    throw new Error("邮箱必填");
  }

  console.log("发送 OTP 注册链接到邮箱:", email);

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) {
      throw handleAuthError(error);
    }

    console.log("注册链接已发送，请检查您的邮箱完成注册");
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
      console.error("登录失败详情:", error);
      throw handleAuthError(error);
    }
    
    if (!data || !data.user) {
      console.error("登录数据不完整");
      throw new Error("登录失败，请稍后再试");
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

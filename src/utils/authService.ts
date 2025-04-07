
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/quiz";
import { validateStrongPassword, escapeHtml } from "./securityUtils";

// 用户注册
export const registerUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    // 验证密码强度
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }
    
    // 使用Supabase进行用户注册
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      }
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("注册失败，未返回用户数据");
    }

    // 返回用户信息
    const userData: User = {
      id: data.user.id,
      email: data.user.email || "",
      displayName: displayName || email.split('@')[0],
      createdAt: data.user.created_at || new Date().toISOString()
    };
    
    return userData;
  } catch (error) {
    console.error("注册错误:", error);
    throw error;
  }
};

// 用户登录
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("登录失败，未返回用户数据");
    }

    // 获取用户资料
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // 构建用户数据
    const userData: User = {
      id: data.user.id,
      email: data.user.email || "",
      displayName: profileData?.display_name || data.user.email?.split('@')[0] || "",
      createdAt: data.user.created_at || new Date().toISOString()
    };
    
    return userData;
  } catch (error) {
    console.error("登录错误:", error);
    throw error;
  }
};

// 获取当前用户
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // 获取用户资料
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email || "",
      displayName: profileData?.display_name || session.user.email?.split('@')[0] || "",
      createdAt: session.user.created_at || ""
    };
  } catch (error) {
    console.error("获取当前用户错误:", error);
    return null;
  }
};

// 检查用户是否已认证
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error("认证检查错误:", error);
    return false;
  }
};

// 用户登出
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("登出错误:", error);
    throw error;
  }
};

// 更新用户资料
export const updateUserProfile = async (displayName: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("用户未登录");
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        display_name: displayName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("更新用户资料错误:", error);
    throw error;
  }
};

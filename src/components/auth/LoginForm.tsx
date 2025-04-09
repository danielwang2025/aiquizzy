
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, sendMagicLink, requestPasswordReset } from "@/utils/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, KeyRound, MoveRight, Loader2 } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

// 为登录表单创建模式验证
const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少为6个字符"),
});

// 为魔术链接创建模式验证
const magicLinkSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  // 登录表单初始化
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 魔术链接表单初始化
  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  // 处理常规登录提交
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoggingIn(true);
      console.log("尝试登录...", values.email);
      await loginUser(values.email, values.password);
      console.log("登录成功!");
      onSuccess?.();
    } catch (error: any) {
      console.error("登录失败:", error.message);
      toast.error(error.message || "登录失败，请稍后再试");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 处理魔术链接登录
  const onMagicLinkSubmit = async (values: z.infer<typeof magicLinkSchema>) => {
    try {
      setIsSendingMagicLink(true);
      await sendMagicLink(values.email);
      toast.success("登录链接已发送到您的邮箱，请查收");
    } catch (error: any) {
      toast.error(error.message || "发送登录链接失败，请稍后再试");
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  // 处理密码重置
  const onResetPasswordSubmit = async (values: z.infer<typeof magicLinkSchema>) => {
    try {
      setIsSendingReset(true);
      await requestPasswordReset(values.email);
      toast.success("密码重置链接已发送到您的邮箱，请查收");
      setForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "发送重置链接失败，请稍后再试");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold">欢迎回来</DialogTitle>
      </DialogHeader>

      {forgotPassword ? (
        <div className="animate-fade-in">
          <p className="text-center text-muted-foreground mb-6">
            请输入您的邮箱地址，我们将发送密码重置链接
          </p>
          
          <Form {...magicLinkForm}>
            <form onSubmit={magicLinkForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
              <FormField
                control={magicLinkForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSendingReset}
              >
                {isSendingReset ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    发送中...
                  </>
                ) : (
                  "发送重置链接"
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setForgotPassword(false)}
              >
                返回登录
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <Tabs defaultValue="password" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="password">密码登录</TabsTrigger>
            <TabsTrigger value="magic-link">魔术链接</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password" className="animate-fade-in">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>密码</FormLabel>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs"
                          type="button"
                          onClick={() => setForgotPassword(true)}
                        >
                          忘记密码?
                        </Button>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      登录
                      <KeyRound className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="magic-link" className="animate-fade-in">
            <Form {...magicLinkForm}>
              <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
                <FormField
                  control={magicLinkForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSendingMagicLink}
                >
                  {isSendingMagicLink ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    <>
                      发送登录链接
                      <Mail className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-6">
        <Separator />
        <p className="text-center text-sm text-muted-foreground mt-4">
          还没有账号?{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={onRegisterClick}
          >
            立即注册
            <MoveRight className="ml-1 h-4 w-4" />
          </Button>
        </p>
      </div>
    </>
  );
};

export default LoginForm;

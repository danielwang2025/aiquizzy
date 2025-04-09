
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser, sendEmailOTP } from "@/utils/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Mail, Loader2, MoveRight } from "lucide-react";
import OTPVerification from "./OTPVerification";

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  displayName: z.string().min(2, "显示名称至少为2个字符").optional(),
});

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      displayName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setIsRegistering(true);
      // 直接发送 OTP 验证码，而不是 Magic Link
      await sendEmailOTP(values.email);
      setRegisterEmail(values.email);
      toast.success("验证码已发送，请查收邮箱");
      setShowOTPVerification(true);
    } catch (error: any) {
      console.error("注册失败:", error);
      toast.error(error.message || "注册失败，请稍后再试");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleOTPSuccess = () => {
    toast.success("验证成功，注册完成！");
    onSuccess?.();
  };

  const handleBackToRegister = () => {
    setShowOTPVerification(false);
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={registerEmail}
        onSuccess={handleOTPSuccess}
        onBack={handleBackToRegister}
      />
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold">创建账户</DialogTitle>
      </DialogHeader>

      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示名称 (可选)</FormLabel>
                  <FormControl>
                    <Input placeholder="您希望展示的名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发送验证码中...
                </>
              ) : (
                <>
                  获取验证码
                  <Mail className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <Separator />
          <p className="text-center text-sm text-muted-foreground mt-4">
            已有账号? {" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={onLoginClick}
            >
              登录
              <MoveRight className="ml-1 h-4 w-4" />
            </Button>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;

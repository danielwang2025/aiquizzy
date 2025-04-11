import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, sendMagicLink, requestPasswordReset, sendEmailOTP, verifyOTP } from "@/utils/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, KeyRound, MoveRight, Loader2, Check, ArrowLeft, RefreshCcw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import OTPVerification from "./OTPVerification";

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

// Create schema validation for login form
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Create schema validation for magic link
const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [emailForOTP, setEmailForOTP] = useState("");

  // Initialize login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize magic link form
  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoggingIn(true);
      console.log("Attempting to log in...", values.email);
      await loginUser(values.email, values.password);
      console.log("Login successful!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Login failed:", error.message);
      toast.error(error.message || "Login failed, please try again later");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle magic link submission - now sending OTP
  const onMagicLinkSubmit = async (values: z.infer<typeof magicLinkSchema>) => {
    try {
      setIsSendingMagicLink(true);
      await sendEmailOTP(values.email);
      setEmailForOTP(values.email);
      toast.success("Verification code has been sent to your email, please check");
      setShowOTPVerification(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code, please try again later");
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  // Handle password reset
  const onResetPasswordSubmit = async (values: z.infer<typeof magicLinkSchema>) => {
    try {
      setIsSendingReset(true);
      await requestPasswordReset(values.email);
      toast.success("Password reset link has been sent to your email, please check");
      setForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link, please try again later");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Handle OTP verification success
  const handleOTPSuccess = () => {
    toast.success("Login successful!");
    onSuccess?.();
  };

  // Return to login form
  const handleBackToLogin = () => {
    setShowOTPVerification(false);
  };

  if (showOTPVerification) {
    return (
      <OTPVerification 
        email={emailForOTP} 
        onSuccess={handleOTPSuccess} 
        onBack={handleBackToLogin} 
      />
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold">Welcome Back</DialogTitle>
      </DialogHeader>

      {forgotPassword ? (
        <div className="animate-fade-in">
          <p className="text-center text-muted-foreground mb-6">
            Please enter your email address, and we will send a password reset link
          </p>
          
          <Form {...magicLinkForm}>
            <form onSubmit={magicLinkForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
              <FormField
                control={magicLinkForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setForgotPassword(false)}
              >
                Back to Login
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <Tabs defaultValue="password" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="password">Password Login</TabsTrigger>
            <TabsTrigger value="magic-link">OTP Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password" className="animate-fade-in">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                        <FormLabel>Password</FormLabel>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs"
                          type="button"
                          onClick={() => setForgotPassword(true)}
                        >
                          Forgot password?
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
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
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
                      <FormLabel>Email</FormLabel>
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
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Verification Code
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
          Don't have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={onRegisterClick}
          >
            Sign up now
            <MoveRight className="ml-1 h-4 w-4" />
          </Button>
        </p>
      </div>
    </>
  );
};

export default LoginForm;

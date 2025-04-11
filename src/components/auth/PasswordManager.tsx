import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateUserPassword, requestPasswordReset } from "@/utils/authService";
import { validateStrongPassword, escapeHtml } from "@/utils/securityUtils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Key, Save, ShieldAlert } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const formSchema = z.object({
  currentPassword: z.string().min(1, "Current password cannot be empty"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "The new passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const PasswordManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const watchNewPassword = form.watch("newPassword");
  
  // Update password strength when password changes
  React.useEffect(() => {
    if (!watchNewPassword) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (watchNewPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(watchNewPassword)) strength += 1;
    if (/[a-z]/.test(watchNewPassword)) strength += 1;
    if (/[0-9]/.test(watchNewPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(watchNewPassword)) strength += 1;
    
    setPasswordStrength(strength);
  }, [watchNewPassword]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      // Validate password strength
      const validation = validateStrongPassword(values.newPassword);
      if (!validation.isValid) {
        form.setError("newPassword", { 
          type: "manual", 
          message: validation.message 
        });
        return;
      }
      
      await updateUserPassword(values.newPassword);
      
      toast.success("Password updated successfully");
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    const email = form.getValues("currentPassword");
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setIsResetLoading(true);
      await requestPasswordReset(email);
      toast.success("Password reset link has been sent to your email");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send password reset link";
      toast.error(errorMessage);
    } finally {
      setIsResetLoading(false);
    }
  };
  
  return (
    <Card className="w-full glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Change Password
        </CardTitle>
        <CardDescription>
          Regularly updating your password can improve account security
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Current Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter current password"
                        type={showCurrentPassword ? "text" : "password"}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    New Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Set a new password"
                        type={showNewPassword ? "text" : "password"}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === 0 ? 'w-0' :
                          passwordStrength === 1 ? 'w-1/5 bg-red-500' :
                          passwordStrength === 2 ? 'w-2/5 bg-orange-500' :
                          passwordStrength === 3 ? 'w-3/5 bg-yellow-500' :
                          passwordStrength === 4 ? 'w-4/5 bg-lime-500' :
                          'w-full bg-green-500'
                        }`}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be 8-12 characters long and include uppercase letters, lowercase letters, numbers, and special characters.
                    </p>
                  </div>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Confirm New Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Re-enter new password"
                        type={showConfirmPassword ? "text" : "password"}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save New Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="w-full border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Forgot Password?</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            If you forgot your password, we can send a reset link to your email.
          </p>
          <Button 
            variant="outline" 
            disabled={isResetLoading} 
            onClick={handlePasswordReset}
          >
            {isResetLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : "Send Reset Link"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PasswordManager;

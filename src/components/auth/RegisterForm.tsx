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
  email: z.string().email("Please enter a valid email address."),
  displayName: z.string().min(2, "Display name must be at least 2 characters.").optional(),
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
      // Directly send the OTP code instead of a Magic Link
      await sendEmailOTP(values.email);
      setRegisterEmail(values.email);
      toast.success("Verification code sent. Please check your email.");
      setShowOTPVerification(true);
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed. Please try again later.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleOTPSuccess = () => {
    toast.success("Verification successful. Registration complete!");
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
        <DialogTitle className="text-center text-2xl font-bold">Create Account</DialogTitle>
      </DialogHeader>

      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your preferred display name" {...field} />
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
                  Sending verification code...
                </>
              ) : (
                <>
                  Get Verification Code
                  <Mail className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <Separator />
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? {" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={onLoginClick}
            >
              Log In
              <MoveRight className="ml-1 h-4 w-4" />
            </Button>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;

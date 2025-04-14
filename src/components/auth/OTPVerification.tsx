import React, { useState, useEffect } from "react";
import { verifyOTP, sendEmailOTP } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft, Check, RefreshCcw } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onSuccess, onBack }) => {
  const [otpValue, setOtpValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpValue || otpValue.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await verifyOTP(email, otpValue);
      toast.success("Verification successful.");
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sendEmailOTP(email);
      toast.success("Verification code resent.");
      setResendCooldown(60); // Start 60-second cooldown
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send verification code.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Verify Email
        </h1>
        <p className="text-muted-foreground">
          We have sent a verification code to <span className="font-medium">{email}</span>.<br />
          Please enter the code to complete registration.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={(value) => {
              setOtpValue(value);
              setError(null);
            }}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} index={index} {...slot} className="w-12 h-12" />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        
        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20"
            disabled={isLoading || otpValue.length !== 6}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Verify
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </form>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Didn't receive the code?{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-normal underline"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || isLoading}
          >
            {resendCooldown > 0 ? (
              <span>Resend in {resendCooldown} seconds</span>
            ) : (
              <>
                <RefreshCcw className="mr-1 h-3 w-3 inline" />
                Resend
              </>
            )}
          </Button>
        </p>
      </div>
    </motion.div>
  );
};

export default OTPVerification;

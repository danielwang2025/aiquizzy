
import React, { useState } from "react";
import { verifyOTP } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft, Check } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onSuccess, onBack }) => {
  const [otpValue, setOtpValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpValue || otpValue.length !== 6) {
      setError("请输入完整的6位验证码");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await verifyOTP(email, otpValue);
      toast.success("验证成功");
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "验证失败";
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
          验证邮箱
        </h1>
        <p className="text-muted-foreground">
          我们已向 <span className="font-medium">{email}</span> 发送了一个验证码。<br />
          请输入验证码以完成注册。
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
                验证中...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                验证
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
            返回
          </Button>
        </div>
      </form>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>
          没有收到验证码？{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-normal underline"
            onClick={() => toast.info("已重新发送验证码")}
          >
            重新发送
          </Button>
        </p>
      </div>
    </motion.div>
  );
};

export default OTPVerification;


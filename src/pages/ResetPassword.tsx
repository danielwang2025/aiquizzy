import React, { useState, useEffect } from "react";
import { updateUserPassword } from "@/utils/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { validateStrongPassword } from "@/utils/securityUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, KeyRound, Save, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  // Check if we have a valid reset token
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        const hashFragment = window.location.hash;
        if (!hashFragment || !hashFragment.includes('type=recovery')) {
          setIsValid(false);
          return;
        }

        // Extract token from hash if present
        const params = new URLSearchParams(hashFragment.replace('#', ''));
        const accessToken = params.get('access_token');

        if (!accessToken) {
          setIsValid(false);
          return;
        }

        // Try to get user with the token
        const { data, error } = await supabase.auth.getUser(accessToken);

        if (error || !data.user) {
          setIsValid(false);
          return;
        }

        // Token is valid
        setIsValid(true);
      } catch (error) {
        console.error("Error checking reset token:", error);
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkResetToken();
  }, []);

  // Update password strength when password changes
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordError(null);
      return;
    }

    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);

    // Validate password
    const validation = validateStrongPassword(password);
    setPasswordError(validation.isValid ? null : validation.message);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const validation = validateStrongPassword(password);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      await updateUserPassword(password);
      toast.success("Password reset successfully");

      // Redirect to profile after short delay
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Password reset failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <Navigation />

      <main className="py-20 px-4">
        <div className="container mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-effect">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                  <KeyRound className="h-6 w-6 text-primary" />
                  Reset Password
                </CardTitle>
                <CardDescription className="text-center">
                  Please set your new password
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="mt-1">
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

                      {passwordError && (
                        <div className="text-xs text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      {!passwordError && password && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Password must be 8-12 characters long and include uppercase letters, lowercase letters, numbers, and special characters.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 transition-all"
                    disabled={isLoading || passwordError !== null || !password || !confirmPassword || password !== confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save New Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="text-center text-sm text-muted-foreground">
                <p className="w-full">
                  After resetting your password, you will use the new password to log in to your account.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;

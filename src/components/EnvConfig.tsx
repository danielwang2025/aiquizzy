
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Key, Save, AlertTriangle } from "lucide-react";
import { getAllDevEnvVars, setDevEnvVar, REQUIRED_ENV_VARS, hasAllRequiredEnvVars } from "@/utils/envConfig";
import { toast } from "sonner";

const EnvConfig = () => {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [hasMissingVars, setHasMissingVars] = useState(false);

  useEffect(() => {
    const storedVars = getAllDevEnvVars();
    setEnvVars(storedVars);
    
    // Check if we have all required environment variables
    setHasMissingVars(!hasAllRequiredEnvVars());
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEnvVars((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    Object.entries(envVars).forEach(([name, value]) => {
      setDevEnvVar(name, value);
    });
    toast.success("环境变量已保存。在开发模式下，这些值将从本地存储中读取。");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={hasMissingVars ? "destructive" : "outline"} 
          size="sm" 
          className="ml-2" 
          title="配置环境变量"
        >
          {hasMissingVars ? (
            <>
              <AlertTriangle className="h-4 w-4 mr-1" />
              配置API密钥
            </>
          ) : (
            <Settings className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>环境变量配置</DialogTitle>
          <DialogDescription>
            配置应用程序所需的API密钥和环境变量。在开发模式下，这些值将安全地存储在本地存储中。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {REQUIRED_ENV_VARS.map((varName) => (
            <div key={varName} className="space-y-2">
              <div className="flex items-center">
                <Key className="mr-2 h-4 w-4" />
                <label htmlFor={varName} className="text-sm font-medium">
                  {varName}
                </label>
              </div>
              <Input
                id={varName}
                name={varName}
                type="password"
                value={envVars[varName] || ''}
                onChange={handleChange}
                placeholder={`输入 ${varName}`}
                className={!envVars[varName] ? "border-red-300" : ""}
              />
              {!envVars[varName] && (
                <p className="text-xs text-red-500">此环境变量是必需的</p>
              )}
            </div>
          ))}
          
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4">
            <p className="text-amber-800 text-sm">
              <AlertTriangle className="h-4 w-4 inline-block mr-1" />
              注意：这些值仅用于开发目的。在生产环境中，请使用适当的环境变量注入方法，如.env文件或CI/CD环境变量。
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            保存环境变量
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnvConfig;

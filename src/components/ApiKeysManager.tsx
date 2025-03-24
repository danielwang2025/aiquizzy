
import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Key, Save, X } from "lucide-react";
import { getAllApiKeys, setAllApiKeys, ApiKeys } from "@/utils/envVars";
import { toast } from "sonner";

const ApiKeysManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    DEEPSEEK_API_KEY: "",
    BREVO_API_KEY: "",
    OPENAI_API_KEY: "",
  });

  useEffect(() => {
    const keys = getAllApiKeys();
    setApiKeys(keys);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setAllApiKeys(apiKeys);
    toast.success("API keys saved successfully");
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2" title="API Keys Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>API Keys Configuration</DrawerTitle>
            <DrawerDescription>
              Configure the API keys needed for the application to function properly.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  <label htmlFor="DEEPSEEK_API_KEY" className="text-sm font-medium">
                    DeepSeek API Key
                  </label>
                </div>
                <Input
                  id="DEEPSEEK_API_KEY"
                  name="DEEPSEEK_API_KEY"
                  type="password"
                  value={apiKeys.DEEPSEEK_API_KEY}
                  onChange={handleChange}
                  placeholder="Enter DeepSeek API Key"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  <label htmlFor="BREVO_API_KEY" className="text-sm font-medium">
                    Brevo API Key
                  </label>
                </div>
                <Input
                  id="BREVO_API_KEY"
                  name="BREVO_API_KEY"
                  type="password"
                  value={apiKeys.BREVO_API_KEY}
                  onChange={handleChange}
                  placeholder="Enter Brevo API Key"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  <label htmlFor="OPENAI_API_KEY" className="text-sm font-medium">
                    OpenAI API Key (for content moderation)
                  </label>
                </div>
                <Input
                  id="OPENAI_API_KEY"
                  name="OPENAI_API_KEY"
                  type="password"
                  value={apiKeys.OPENAI_API_KEY}
                  onChange={handleChange}
                  placeholder="Enter OpenAI API Key"
                />
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save API Keys
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ApiKeysManager;

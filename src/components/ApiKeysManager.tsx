
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
import { Settings, Key, Save, X, AlertCircle, Server } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the ApiKeys interface directly in this file
interface ApiKeys {
  DEEPSEEK_API_KEY: string;
  BREVO_API_KEY: string;
  DEEPSEEK_API_KEY_MODERATION: string;
}

const ApiKeysManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    DEEPSEEK_API_KEY: "",
    BREVO_API_KEY: "",
    DEEPSEEK_API_KEY_MODERATION: "",
  });
  
  const [isProduction, setIsProduction] = useState(false);
  const [missingProductionKeys, setMissingProductionKeys] = useState<string[]>([]);

  useEffect(() => {
    // Initialize with values from localStorage if they exist
    const storedKeys: ApiKeys = {
      DEEPSEEK_API_KEY: localStorage.getItem("DEEPSEEK_API_KEY") || "",
      BREVO_API_KEY: localStorage.getItem("BREVO_API_KEY") || "",
      DEEPSEEK_API_KEY_MODERATION: localStorage.getItem("DEEPSEEK_API_KEY_MODERATION") || "",
    };
    setApiKeys(storedKeys);
    
    // Check if in production environment
    checkEnvironment();
  }, []);
  
  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/check-api-keys');
      if (response.ok) {
        setIsProduction(true);
        const data = await response.json();
        if (data.optionalMissingKeys) {
          setMissingProductionKeys(data.optionalMissingKeys);
        }
      } else {
        const data = await response.json().catch(() => ({}));
        if (data.missingKeys) {
          setMissingProductionKeys(data.missingKeys);
          setIsProduction(true);
        }
      }
    } catch (error) {
      // If API is unreachable, likely in local development environment
      setIsProduction(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Save to localStorage
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(key, value);
      }
    });
    
    toast.success("API keys saved to local storage");
    toast.info("This is only for local development. In production, please use Vercel environment variables.", {
      duration: 5000,
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2" title="API Key Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>API Key Configuration</DrawerTitle>
            <DrawerDescription>
              Configure the API keys required for the application to function properly.
            </DrawerDescription>
          </DrawerHeader>
          
          <Tabs defaultValue={isProduction ? "production" : "development"} className="w-full px-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="development">Local Development</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
            </TabsList>
            
            <TabsContent value="development">
              <div className="p-4">
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This form is only for local development. For production deployments, please set these keys as environment variables in the Vercel dashboard.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4 mt-4">
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
                      <label htmlFor="DEEPSEEK_API_KEY_MODERATION" className="text-sm font-medium">
                        DeepSeek API Key for Content Moderation
                      </label>
                    </div>
                    <Input
                      id="DEEPSEEK_API_KEY_MODERATION"
                      name="DEEPSEEK_API_KEY_MODERATION"
                      type="password"
                      value={apiKeys.DEEPSEEK_API_KEY_MODERATION}
                      onChange={handleChange}
                      placeholder="Enter DeepSeek API Key for moderation (optional)"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSave} className="mt-6 w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save API Keys
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="production">
              <div className="p-4">
                <Alert className="mb-4">
                  <Server className="h-4 w-4" />
                  <AlertDescription>
                    In production, API keys should be set via Vercel environment variables, not through this interface.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 space-y-4">
                  {isProduction ? (
                    <>
                      {missingProductionKeys.length > 0 ? (
                        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                          <h3 className="text-sm font-medium text-red-800">The following environment variables are missing:</h3>
                          <ul className="mt-2 list-disc list-inside text-red-700 text-sm">
                            {missingProductionKeys.map(key => (
                              <li key={key}>{key}</li>
                            ))}
                          </ul>
                          <p className="mt-2 text-sm text-red-700">
                            Please set these environment variables in the Vercel dashboard.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                          <h3 className="text-sm font-medium text-green-800">All required API keys are configured!</h3>
                          <p className="mt-2 text-sm text-green-700">
                            Your application is ready to run in production.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                      <h3 className="text-sm font-medium text-amber-800">Cannot check server environment variables</h3>
                      <p className="mt-2 text-sm text-amber-700">
                        This is normal if you are running in a local development environment. When deploying to Vercel, make sure to set all required environment variables.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Required environment variables:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>DEEPSEEK_API_KEY - for AI generation features</li>
                      <li>BREVO_API_KEY - for sending emails</li>
                    </ul>
                    
                    <h3 className="text-sm font-medium mt-4 mb-2">Optional environment variables:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>DEEPSEEK_API_KEY_MODERATION - for enhanced content moderation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ApiKeysManager;

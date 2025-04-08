
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
  OPENAI_API_KEY: string;
}

const ApiKeysManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    DEEPSEEK_API_KEY: "",
    BREVO_API_KEY: "",
    OPENAI_API_KEY: "",
  });
  
  const [isProduction, setIsProduction] = useState(false);
  const [missingProductionKeys, setMissingProductionKeys] = useState<string[]>([]);

  useEffect(() => {
    // Initialize with values from localStorage if they exist
    const storedKeys: ApiKeys = {
      DEEPSEEK_API_KEY: localStorage.getItem("DEEPSEEK_API_KEY") || "",
      BREVO_API_KEY: localStorage.getItem("BREVO_API_KEY") || "",
      OPENAI_API_KEY: localStorage.getItem("OPENAI_API_KEY") || "",
    };
    setApiKeys(storedKeys);
    
    // 检查是否在生产环境中
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
      // 如果无法到达 API，可能是在本地开发环境中
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
    
    toast.success("API 密钥已保存到本地存储");
    toast.info("这只适用于本地开发。在生产环境中，请使用 Vercel 环境变量。", {
      duration: 5000,
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2" title="API 密钥设置">
          <Settings className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>API 密钥配置</DrawerTitle>
            <DrawerDescription>
              配置应用程序正常运行所需的 API 密钥。
            </DrawerDescription>
          </DrawerHeader>
          
          <Tabs defaultValue={isProduction ? "production" : "development"} className="w-full px-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="development">本地开发</TabsTrigger>
              <TabsTrigger value="production">生产环境</TabsTrigger>
            </TabsList>
            
            <TabsContent value="development">
              <div className="p-4">
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    此表单仅用于本地开发。对于生产部署，请在 Vercel 仪表板中设置这些密钥为环境变量。
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      <label htmlFor="DEEPSEEK_API_KEY" className="text-sm font-medium">
                        DeepSeek API 密钥
                      </label>
                    </div>
                    <Input
                      id="DEEPSEEK_API_KEY"
                      name="DEEPSEEK_API_KEY"
                      type="password"
                      value={apiKeys.DEEPSEEK_API_KEY}
                      onChange={handleChange}
                      placeholder="输入 DeepSeek API 密钥"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      <label htmlFor="BREVO_API_KEY" className="text-sm font-medium">
                        Brevo API 密钥
                      </label>
                    </div>
                    <Input
                      id="BREVO_API_KEY"
                      name="BREVO_API_KEY"
                      type="password"
                      value={apiKeys.BREVO_API_KEY}
                      onChange={handleChange}
                      placeholder="输入 Brevo API 密钥"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      <label htmlFor="OPENAI_API_KEY" className="text-sm font-medium">
                        OpenAI API 密钥 (用于内容审核)
                      </label>
                    </div>
                    <Input
                      id="OPENAI_API_KEY"
                      name="OPENAI_API_KEY"
                      type="password"
                      value={apiKeys.OPENAI_API_KEY}
                      onChange={handleChange}
                      placeholder="输入 OpenAI API 密钥"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSave} className="mt-6 w-full">
                  <Save className="mr-2 h-4 w-4" />
                  保存 API 密钥
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="production">
              <div className="p-4">
                <Alert className="mb-4">
                  <Server className="h-4 w-4" />
                  <AlertDescription>
                    在生产环境中，API 密钥应通过 Vercel 环境变量设置，而不是通过此界面。
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 space-y-4">
                  {isProduction ? (
                    <>
                      {missingProductionKeys.length > 0 ? (
                        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                          <h3 className="text-sm font-medium text-red-800">缺少以下环境变量：</h3>
                          <ul className="mt-2 list-disc list-inside text-red-700 text-sm">
                            {missingProductionKeys.map(key => (
                              <li key={key}>{key}</li>
                            ))}
                          </ul>
                          <p className="mt-2 text-sm text-red-700">
                            请在 Vercel 仪表板中设置这些环境变量。
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                          <h3 className="text-sm font-medium text-green-800">所有必需的 API 密钥已配置！</h3>
                          <p className="mt-2 text-sm text-green-700">
                            您的应用程序已准备好在生产环境中运行。
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                      <h3 className="text-sm font-medium text-amber-800">无法检查服务器环境变量</h3>
                      <p className="mt-2 text-sm text-amber-700">
                        如果您正在本地开发环境中运行，这是正常的。部署到 Vercel 时，请确保设置所有必需的环境变量。
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">必需的环境变量：</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>DEEPSEEK_API_KEY - 用于 AI 生成功能</li>
                      <li>BREVO_API_KEY - 用于发送电子邮件</li>
                    </ul>
                    
                    <h3 className="text-sm font-medium mt-4 mb-2">可选的环境变量：</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      <li>OPENAI_API_KEY - 用于增强内容审核</li>
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
                关闭
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ApiKeysManager;


import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

const ApiKeyNotice: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // 检查本地存储中是否已经关闭了通知
    const dismissed = localStorage.getItem('apiKeyNoticeDismissed');
    
    // 尝试调用 API 端点以检查是否设置了环境变量
    const checkApiKeys = async () => {
      try {
        const response = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            learningObjectives: "test"
          })
        });
        
        const data = await response.json();
        
        // 如果返回错误是关于 API 密钥的，则显示横幅
        if (data.error && data.error.includes('API key not configured') && !dismissed) {
          setShowBanner(true);
        }
      } catch (error) {
        // 如果 API 端点不可用，可能是因为应用正在本地开发中，或者服务器端尚未配置
        if (!dismissed) {
          setShowBanner(true);
        }
      }
    };
    
    checkApiKeys();
  }, []);
  
  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('apiKeyNoticeDismissed', 'true');
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 fixed bottom-4 right-4 max-w-md rounded shadow-lg z-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            请在 Vercel 环境变量中配置需要的 API 密钥：
            <strong>DEEPSEEK_API_KEY</strong>, <strong>BREVO_API_KEY</strong>, 以及可选的 <strong>OPENAI_API_KEY</strong>。
          </p>
          <div className="mt-2">
            <button
              onClick={() => {
                // 复制提示到剪贴板
                navigator.clipboard.writeText('DEEPSEEK_API_KEY, BREVO_API_KEY, OPENAI_API_KEY');
                toast.success('已复制 API 密钥名称到剪贴板');
              }}
              className="text-sm text-amber-700 hover:text-amber-600 font-medium underline"
            >
              复制密钥名称
            </button>
          </div>
        </div>
        <div className="ml-auto">
          <button
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={dismissBanner}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyNotice;

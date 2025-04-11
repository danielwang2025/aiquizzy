
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, AlertCircle } from "lucide-react";

const ApiKeyNotice: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  
  useEffect(() => {
    // Check if the notice has already been dismissed in this session
    const dismissed = sessionStorage.getItem('apiKeyNoticeDismissed');
    
    // Only check API keys if not dismissed
    if (!dismissed) {
      checkApiKeys();
    }
  }, []);
  
  const checkApiKeys = async () => {
    try {
      const response = await fetch('/api/check-api-keys');
      
      if (!response.ok) {
        const data = await response.json();
        if (data.missingKeys && data.missingKeys.length > 0) {
          setShowBanner(true);
          setMissingKeys(data.missingKeys);
          // Log to console for developers
          console.warn('Missing required environment variables:', data.missingKeys);
        }
      } else {
        const data = await response.json();
        // Check for optional keys
        if (data.optionalMissingKeys && data.optionalMissingKeys.length > 0) {
          setShowBanner(true);
          setMissingKeys(data.optionalMissingKeys);
          console.info('Missing optional environment variables:', data.optionalMissingKeys);
        }
      }
    } catch (error) {
      // Silent fail in production, log in development
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error checking API keys:", error);
      }
    }
  };
  
  const dismissBanner = () => {
    setShowBanner(false);
    // Use sessionStorage instead of localStorage to make it persist only for current session
    sessionStorage.setItem('apiKeyNoticeDismissed', 'true');
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 fixed bottom-4 right-4 max-w-md rounded shadow-lg z-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            {missingKeys.length > 0 ? (
              <>
                Missing environment variables in Vercel:
                <strong className="block mt-1">
                  {missingKeys.join(', ')}
                </strong>
              </>
            ) : (
              "Please configure the required API keys in the Vercel environment variables."
            )}
          </p>
          <div className="mt-2 flex space-x-3">
            <button
              onClick={() => {
                // Copy the hint to the clipboard
                navigator.clipboard.writeText(missingKeys.join(', '));
                toast.success('API key names copied to clipboard');
              }}
              className="text-sm text-amber-700 hover:text-amber-600 font-medium underline"
            >
              Copy key names
            </button>
            
            <a
              href="https://vercel.com/docs/projects/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-700 hover:text-amber-600 font-medium underline"
            >
              Vercel docs
            </a>
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

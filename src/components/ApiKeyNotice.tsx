
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, AlertCircle } from "lucide-react";

const ApiKeyNotice: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  
  useEffect(() => {
    // Check if the notice has already been dismissed in local storage
    const dismissed = localStorage.getItem('apiKeyNoticeDismissed');
    
    // Attempt to call the API endpoint to check if environment variables are set
    const checkApiKeys = async () => {
      try {
        const response = await fetch('/api/check-api-keys');
        const data = await response.json();
        
        // If we have missing required keys or optional keys, show the banner
        if (!response.ok) {
          if (data.missingKeys && data.missingKeys.length > 0 && !dismissed) {
            setShowBanner(true);
            setMissingKeys(data.missingKeys);
          }
        } else if (data.optionalMissingKeys && data.optionalMissingKeys.length > 0 && !dismissed) {
          // Show banner for optional missing keys but with different styling
          setShowBanner(true);
          setMissingKeys(data.optionalMissingKeys);
        }
      } catch (error) {
        // If the API endpoint is unavailable, it might be because the app is in local development
        // or the server side is not configured yet
        console.error("Error checking API keys:", error);
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
              href="https://vercel.com/docs/concepts/projects/environment-variables"
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

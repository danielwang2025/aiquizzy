
/**
 * API service for handling various API calls
 */

import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if API keys are configured correctly
 */
export const checkApiConfiguration = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/check-api-keys');
    const data = await response.json();
    
    if (!data.success) {
      console.error('API key configuration check failed:', data.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking API keys:', error);
    return false;
  }
};

/**
 * Generic API handling error method
 */
export const handleApiError = (error: unknown, defaultMessage = 'Operation failed'): string => {
  console.error('API error:', error);
  
  if (error instanceof Error) {
    toast.error(error.message || defaultMessage);
    return error.message;
  } else {
    toast.error(defaultMessage);
    return defaultMessage;
  }
};

/**
 * Common fetch wrapper with authorization
 */
export async function fetchWithAuth<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status: ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    handleApiError(error, 'API request failed');
    throw error;
  }
}

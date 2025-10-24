// src/utils/corsErrorHandler.jsx
import { toast } from 'sonner';

export const handleCorsError = (error) => {
  if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
    console.error('CORS Error:', error);
    
    // Show user-friendly message
    const message = 'Network connection issue. Please check if the server is running and try again.';
    toast.error(message);
    
    return true; // Error handled
  }
  return false; // Error not handled
};

export const retryRequest = async (requestFn, maxRetries = 3) => {
  const attemptRequest = async (attempt) => {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = (2 ** attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return attemptRequest(attempt + 1);
    }
  };
  
  return attemptRequest(0);
};

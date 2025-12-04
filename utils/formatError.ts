export const getFriendlyErrorMessage = (error: any): string => {
  if (!error) return "An unexpected error occurred.";

  // 1. Check for specific text patterns in stringified error or message
  // This catches cases where the error object is coerced to string or passed as string
  const stringVal = typeof error === 'string' ? error : (error.message || '');
  const code = error.code;
  
  // Explicitly catch unauthorized domain errors from code or message string
  if (
    code === 'auth/unauthorized-domain' || 
    (typeof stringVal === 'string' && stringVal.includes('auth/unauthorized-domain'))
  ) {
    const currentDomain = window.location.hostname;
    return `Domain Authorization Error: The current domain (${currentDomain}) is not authorized for Google Sign-In. Please add "${currentDomain}" to your Firebase Console under Authentication > Settings > Authorized Domains.`;
  }

  // 2. If it's a simple string that didn't match above, return it
  if (typeof error === 'string') return error;

  // 3. Map specific Firebase codes
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return "Incorrect email or password. Please try again.";
    case 'auth/email-already-in-use':
      return "This email is already registered. Please log in instead.";
    case 'auth/weak-password':
      return "Password is too weak. Please use a stronger password (min 6 characters).";
    case 'auth/invalid-email':
      return "Please enter a valid email address.";
    case 'auth/network-request-failed':
      return "Network error. Please check your internet connection.";
    case 'auth/too-many-requests':
      return "Access temporarily disabled due to too many failed attempts. Reset password or try again later.";
    case 'auth/popup-closed-by-user':
      return "Sign-in was cancelled by the user.";
    case 'auth/popup-blocked':
      return "Sign-in popup was blocked by the browser. Please allow popups for this site.";
    case 'auth/requires-recent-login':
      return "For security, please log in again to perform this action.";
    case 'storage/unauthorized':
      return "You do not have permission to upload this file.";
    case 'storage/canceled':
      return "Upload was cancelled.";
    case 'storage/object-not-found':
      return "File not found.";
    case 'storage/file-too-large':
      return "File is too large. Please upload a smaller image (max 5MB).";
    default:
      // Fallback: Clean up the raw message
      if (typeof stringVal === 'string') {
        let cleanMessage = stringVal.replace(/^Firebase:\s?/, '').replace(/^Error:\s?/, '');
        cleanMessage = cleanMessage.replace(/\s?\(auth\/.*\)\.?$/, '');
        cleanMessage = cleanMessage.replace(/\s?\(storage\/.*\)\.?$/, '');
        return cleanMessage;
      }
      return "Something went wrong. Please try again.";
  }
};
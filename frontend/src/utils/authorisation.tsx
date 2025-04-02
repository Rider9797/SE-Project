/**
 * Authentication Token Utilities
 * Centralized handling of JWT tokens in localStorage
 */

// Types
type AuthToken = string | null;

/**
 * Stores the authentication token
 * @param token - JWT token received from backend
 */
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem('token', token);
    console.debug('Auth token stored'); // Remove in production
  } catch (error) {
    console.error('Failed to store auth token:', error);
    throw new Error('Failed to persist authentication');
  }
};

/**
 * Retrieves the authentication token
 * @returns Token string or null if not found
 */
export const getAuthToken = (): AuthToken => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
};

/**
 * Removes the authentication token
 */
export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem('token');
    console.debug('Auth token removed'); // Remove in production
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

/**
 * Checks if user is authenticated
 * @returns boolean - true if token exists
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Gets token with validation
 * @returns string - token
 * @throws Error if no token found
 */
export const getValidatedToken = (): string => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }
  return token;
};
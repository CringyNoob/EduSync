/**
 * Decode JWT token to extract user information
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;

  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 decode
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    const parsed = JSON.parse(decoded);
    
    // Check if token is expired
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      console.warn('Token has expired');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user data from stored token
 * @returns {Object|null} - User data or null if no valid token
 */
export const getUserFromToken = () => {
  const token = localStorage.getItem('edusync_token');
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  // Extract user info from token payload
  // Token structure from auth-service: { id, name, email, department, batch }
  return {
    id: decoded.id,
    name: decoded.name,
    email: decoded.email,
    role: 'Student', // Default role, can be added to token later
    department: decoded.department,
    batch: decoded.batch,
  };
};

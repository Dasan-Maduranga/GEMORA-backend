/**
 * Authentication utility functions
 * Helper functions for managing tokens and user session state
 */

// Retrieve JWT token from browser localStorage
export const getToken = () => localStorage.getItem("token");

// Remove JWT token from browser localStorage
export const logout = () => localStorage.removeItem("token");

// Check if user is authenticated by verifying token exists
export const isLoggedIn = () => !!getToken();

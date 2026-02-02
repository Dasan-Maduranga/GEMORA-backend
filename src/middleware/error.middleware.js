/**
 * Global error handling middleware
 * Catches all errors and sends appropriate error responses
 */

module.exports = (err, req, res, next) => {
  // Log error for debugging
  console.error(err);
  
  // Send error response with status code and message
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
};

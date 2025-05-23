/**
 * Validation middleware for Simple Picture Database
 */

/**
 * Validate picture upload/update request
 */
function validatePicture(req, res, next) {
  const errors = [];
    // Validate description
  if (req.body.description !== undefined) {
    const description = req.body.description.trim();
    
    if (description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }
    
    // Sanitize description (basic XSS protection)
    req.body.description = description
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  // For file uploads, Multer will handle the validation
  // Here we can add additional custom validations if needed
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}

/**
 * Validate pagination parameters
 */
function validatePagination(req, res, next) {
  // Set default values
  req.query.page = req.query.page || '1';
  req.query.limit = req.query.limit || '10';
  
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);
  
  const errors = [];
  
  if (isNaN(page) || page < 1) {
    errors.push('Page must be a positive number');
  }
  
  if (isNaN(limit) || limit < 1 || limit > 100) {
    errors.push('Limit must be between 1 and 100');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}

module.exports = {
  validatePicture,
  validatePagination
};

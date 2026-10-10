const ApiError = require('../utils/ApiError');

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
}

module.exports = { requireRole };

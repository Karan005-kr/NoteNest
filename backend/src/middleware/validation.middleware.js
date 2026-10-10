const ApiError = require('../utils/ApiError');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(422, 'Validation failed.', errors));
    }
    req[source] = parsed.data;
    next();
  };
}

module.exports = { validate };

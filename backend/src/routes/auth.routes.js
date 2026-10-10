const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validation.middleware');
const { authenticateAdmin } = require('../middleware/auth.middleware');
const { loginSchema } = require('../validators/schemas');
const auth = require('../controllers/auth.controller');

router.post('/login', validate(loginSchema), asyncHandler(auth.login));
router.get('/me', authenticateAdmin, asyncHandler(auth.me));
router.post('/logout', authenticateAdmin, asyncHandler(auth.logout));

module.exports = router;

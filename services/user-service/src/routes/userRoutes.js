const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { updateProfileValidation } = require('../middlewares/validateRequest');

// Profile routes: GET /api/users/profile & PUT /api/users/profile (and /me alias)
router
  .route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfileValidation, updateProfile);

router
  .route('/me')
  .get(protect, getProfile)
  .put(protect, updateProfileValidation, updateProfile);

module.exports = router;

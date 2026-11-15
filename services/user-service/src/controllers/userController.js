const User = require('../models/User');

/**
 * @desc    Get authenticated user profile
 * @route   GET /api/users/profile
 * @access  Private (JWT protected)
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware without password
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update authenticated user profile (name, phone, address)
 * @route   PUT /api/users/profile
 * @access  Private (JWT protected)
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, phone, address } = req.body;

    // Update permitted fields only
    if (name !== undefined && name.trim()) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }
    if (address && typeof address === 'object' && !Array.isArray(address)) {
  const currentAddress = user.address?.toObject?.() || user.address || {};

  user.address = {
    street: address.street !== undefined ? address.street : currentAddress.street || '',
    city: address.city !== undefined ? address.city : currentAddress.city || '',
    state: address.state !== undefined ? address.state : currentAddress.state || '',
    zipCode: address.zipCode !== undefined ? address.zipCode : currentAddress.zipCode || '',
    country: address.country !== undefined ? address.country : currentAddress.country || ''
  };
}

   

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};

const User = require('../models/User');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      status = '' 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Get user statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalAdmins: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          totalStaff: {
            $sum: { $cond: [{ $eq: ['$role', 'staff'] }, 1, 0] }
          },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats: stats[0] || {
        totalUsers: 0,
        totalAdmins: 0,
        totalStaff: 0,
        activeUsers: 0,
        inactiveUsers: 0
      }
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching users.' 
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ 
      error: 'Server error while fetching user.' 
    });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      fullName,
      phone,
      department,
      password,
      role = 'staff',
      status = 'active',
      permissions
    } = req.body;

    // Validate required fields
    if (!username || !email || !fullName || !password) {
      return res.status(400).json({ 
        error: 'Username, email, full name, and password are required.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists.' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      fullName,
      phone,
      department,
      password,
      role,
      status
    });

    // Set default permissions based on role
    user.setDefaultPermissions();

    // Override with custom permissions if provided
    if (permissions) {
      user.permissions = { ...user.permissions, ...permissions };
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Create user error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists.' 
      });
    }
    res.status(500).json({ 
      error: 'Server error while creating user.' 
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      fullName,
      phone,
      department,
      role,
      status,
      permissions
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString() && role && role !== 'admin') {
      return res.status(400).json({ 
        error: 'You cannot change your own role from admin.' 
      });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (role) user.role = role;
    if (status) user.status = status;
    if (permissions) user.permissions = { ...user.permissions, ...permissions };

    // Reset permissions if role changed
    if (role && role !== user.role) {
      user.setDefaultPermissions();
      if (permissions) {
        user.permissions = { ...user.permissions, ...permissions };
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Update user error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists.' 
      });
    }
    res.status(500).json({ 
      error: 'Server error while updating user.' 
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ 
        error: 'You cannot delete your own account.' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ 
      error: 'Server error while deleting user.' 
    });
  }
};

// Reset user password (admin only)
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long.' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({
      success: true,
      message: 'User password reset successfully'
    });
  } catch (err) {
    console.error('Reset user password error:', err);
    res.status(500).json({ 
      error: 'Server error while resetting user password.' 
    });
  }
};

// Toggle user status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ 
        error: 'You cannot change your own account status.' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found.' 
      });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({
      success: true,
      message: `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Toggle user status error:', err);
    res.status(500).json({ 
      error: 'Server error while updating user status.' 
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus
};

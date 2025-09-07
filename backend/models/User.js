const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema with roles and permissions
const userSchema = new mongoose.Schema({
  // Basic user information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  department: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // Permissions (granular control)
  permissions: {
    transportation: {
      viewTrips: { type: Boolean, default: false },
      editTrips: { type: Boolean, default: false },
      createTrips: { type: Boolean, default: false },
      deleteTrips: { type: Boolean, default: false }
    },
    inventory: {
      viewInventory: { type: Boolean, default: false },
      editTrucks: { type: Boolean, default: false },
      addTrucks: { type: Boolean, default: false },
      deleteTrucks: { type: Boolean, default: false }
    },
    reports: {
      viewReports: { type: Boolean, default: false },
      exportReports: { type: Boolean, default: false }
    },
    userManagement: {
      viewUsers: { type: Boolean, default: false },
      editUsers: { type: Boolean, default: false },
      createUsers: { type: Boolean, default: false },
      deleteUsers: { type: Boolean, default: false }
    }
  },
  
  // Password reset functionality
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Login tracking
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, { 
  timestamps: true 
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to set default permissions based on role
userSchema.methods.setDefaultPermissions = function() {
  if (this.role === 'admin') {
    // Admin gets all permissions
    this.permissions = {
      transportation: {
        viewTrips: true,
        editTrips: true,
        createTrips: true,
        deleteTrips: true
      },
      inventory: {
        viewInventory: true,
        editTrucks: true,
        addTrucks: true,
        deleteTrucks: true
      },
      reports: {
        viewReports: true,
        exportReports: true
      },
      userManagement: {
        viewUsers: true,
        editUsers: true,
        createUsers: true,
        deleteUsers: true
      }
    };
  } else {
    // Staff gets basic permissions by default
    this.permissions = {
      transportation: {
        viewTrips: true,
        editTrips: false,
        createTrips: false,
        deleteTrips: false
      },
      inventory: {
        viewInventory: true,
        editTrucks: false,
        addTrucks: false,
        deleteTrucks: false
      },
      reports: {
        viewReports: true,
        exportReports: false
      },
      userManagement: {
        viewUsers: false,
        editUsers: false,
        createUsers: false,
        deleteUsers: false
      }
    };
  }
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(module, action) {
  if (this.role === 'admin') return true;
  return this.permissions[module] && this.permissions[module][action];
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Transform JSON output to remove sensitive data
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

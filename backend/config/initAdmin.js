const User = require('../models/User');

// Create admin user if it doesn't exist
async function createAdminIfNotExists() {
  try {
    const adminEmail = 'admin@transportpro.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const admin = new User({
        username: 'admin',
        email: adminEmail,
        fullName: 'System Administrator',
        phone: '+91 98765 43210',
        department: 'IT Administration',
        password: 'admin123', // Will be hashed by pre-save middleware
        role: 'admin',
        status: 'active'
      });

      // Set admin permissions
      admin.setDefaultPermissions();
      await admin.save();
      
      console.log(' Admin user created successfully:');
      console.log('   Email: admin@transportpro.com');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Admin creation failed:', err.message);
  }
}

// Create a sample staff user for testing
async function createSampleStaff() {
  try {
    const staffEmail = 'staff@transportpro.com';
    const existingStaff = await User.findOne({ email: staffEmail });

    if (!existingStaff) {
      const staff = new User({
        username: 'staff',
        email: staffEmail,
        fullName: 'John Doe',
        phone: '+91 98765 43211',
        department: 'Operations',
        password: 'staff123',
        role: 'staff',
        status: 'active'
      });

      // Set staff permissions
      staff.setDefaultPermissions();
      await staff.save();
      
      console.log(' Sample staff user created successfully:');
      console.log('   Email: staff@transportpro.com');
      console.log('   Username: staff');
      console.log('   Password: staff123');
    } else {
      console.log('  Sample staff user already exists');
    }
  } catch (err) {
    console.error(' Sample staff creation failed:', err.message);
  }
}

module.exports = {
  createAdminIfNotExists,
  createSampleStaff
};

const User = require('../../src/models/User');

describe('User Model', () => {
  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        role: 'nurse'
      };

      const user = await User.create(userData);
      
      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('Password123');
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    test('should not hash password if not modified', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        role: 'nurse'
      });

      const originalHash = user.password;
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('Password Comparison', () => {
    test('should compare password correctly', async () => {
      const password = 'Password123';
      const user = await User.create({
        email: 'test@example.com',
        password,
        name: 'Test User',
        role: 'nurse'
      });

      // Need to fetch with password field
      const userWithPassword = await User.findById(user._id).select('+password');
      
      const isMatch = await userWithPassword.comparePassword(password);
      expect(isMatch).toBe(true);

      const isNotMatch = await userWithPassword.comparePassword('WrongPassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Validation', () => {
    test('should require email', async () => {
      const user = new User({
        password: 'Password123',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    test('should require password to be at least 8 characters', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Pass1',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    test('should require password to contain letter and number', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'PasswordOnly',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    test('should enforce valid role enum', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        role: 'invalid-role'
      });

      await expect(user.save()).rejects.toThrow();
    });

    test('should accept valid roles', async () => {
      const roles = ['admin', 'doctor', 'nurse', 'coordinator'];
      
      for (const role of roles) {
        const user = await User.create({
          email: `${role}@example.com`,
          password: 'Password123',
          name: `Test ${role}`,
          role
        });
        
        expect(user.role).toBe(role);
      }
    });
  });
});

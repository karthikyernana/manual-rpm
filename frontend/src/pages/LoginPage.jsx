import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const features = [
    'Real-time patient monitoring',
    'Smart vitals tracking',
    'Automated alert system',
    'Secure data sharing'
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Side - Branding */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)'
          }}
        />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Circles */}
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'var(--brand-muted)',
              filter: 'blur(60px)',
              top: '10%',
              left: '20%'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: 'var(--info-muted)',
              filter: 'blur(40px)',
              bottom: '20%',
              right: '10%'
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Logo size="large" />

          {/* Main Content */}
          <div className="max-w-lg">
            <motion.h1
              className="text-4xl xl:text-5xl font-bold mb-6"
              style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Patient monitoring,{' '}
              <span className="text-gradient">simplified.</span>
            </motion.h1>

            <motion.p
              className="text-lg mb-8"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Streamline your healthcare workflow with intelligent vitals tracking, 
              automated alerts, and seamless team collaboration.
            </motion.p>

            {/* Features List */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--brand-muted)' }}
                  >
                    <Activity size={12} style={{ color: 'var(--brand-primary)' }} />
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <p
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            © 2024 Vitalis. Built for healthcare professionals.
          </p>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 lg:p-12"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Logo size="large" />
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 rounded-lg"
              style={{
                background: 'var(--error-muted)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm" style={{ color: 'var(--error)' }}>
                {error}
              </p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="you@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight size={18} />
                </span>
              )}
            </motion.button>
          </form>

          {/* Footer Note */}
          <p
            className="mt-8 text-center text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Contact your administrator if you need an account
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

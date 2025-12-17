import { motion } from 'framer-motion';

const Logo = ({ size = 'default', showText = true, animated = true }) => {
  const sizes = {
    small: { icon: 24, text: 'text-lg' },
    default: { icon: 32, text: 'text-xl' },
    large: { icon: 40, text: 'text-2xl' },
  };

  const { icon, text } = sizes[size] || sizes.default;

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
  };

  const pulseVariants = {
    initial: { opacity: 0.6, scale: 0.8 },
    animate: {
      opacity: [0.6, 1, 0.6],
      scale: [0.8, 1.1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? { initial: 'initial', whileHover: 'hover' }
    : {};

  return (
    <Wrapper
      className="flex items-center gap-2.5 cursor-pointer select-none"
      {...wrapperProps}
    >
      {/* Logo Icon */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: icon, height: icon }}
        variants={animated ? iconVariants : undefined}
      >
        {/* Glow Effect */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{ background: 'var(--brand-primary)' }}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
        )}
        
        {/* Main Logo Shape */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          style={{ width: icon, height: icon }}
        >
          {/* Background Circle */}
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="8"
            fill="var(--brand-primary)"
          />
          
          {/* V Letter with Heartbeat */}
          <path
            d="M8 10L12 18L16 12L20 18L24 10"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Bottom Line */}
          <path
            d="M10 22H22"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <span
          className={`font-bold tracking-tight ${text}`}
          style={{ color: 'var(--text-primary)' }}
        >
          Vitalis
        </span>
      )}
    </Wrapper>
  );
};

export default Logo;

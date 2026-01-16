import { motion } from 'framer-motion';

interface ParthenonSVGProps {
  isHovered: boolean;
}

const ParthenonSVG = ({ isHovered }: ParthenonSVGProps) => {
  return (
    <motion.svg
      viewBox="0 0 300 200"
      className="w-full h-full"
      initial={false}
    >
      <defs>
        <linearGradient id="skyAth" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(222, 25%, 12%)' : 'hsl(222, 20%, 10%)' }}
            transition={{ duration: 0.6 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(222, 20%, 18%)' : 'hsl(222, 18%, 15%)' }}
            transition={{ duration: 0.6 }}
          />
        </linearGradient>
        <linearGradient id="monumentAth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(45, 30%, 85%)" />
          <stop offset="100%" stopColor="hsl(45, 25%, 70%)" />
        </linearGradient>
        <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(45, 60%, 55%)" />
          <stop offset="50%" stopColor="hsl(45, 70%, 65%)" />
          <stop offset="100%" stopColor="hsl(45, 60%, 55%)" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="200" fill="url(#skyAth)" />

      {/* Subtle stars */}
      {[
        { x: 45, y: 28 }, { x: 120, y: 18 }, { x: 200, y: 32 }, { x: 260, y: 22 }
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r="1"
          fill="hsl(45, 30%, 80%)"
          animate={{ opacity: isHovered ? [0.4, 0.8, 0.4] : 0.3 }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      {/* Hill silhouette */}
      <motion.path
        d="M0 175 Q80 160 150 165 Q220 155 300 165 L300 200 L0 200 Z"
        animate={{ fill: isHovered ? 'hsl(222, 15%, 22%)' : 'hsl(222, 12%, 18%)' }}
        transition={{ duration: 0.6 }}
      />

      {/* Base platform - three steps */}
      <motion.rect
        x="75" y="148" width="150" height="4"
        animate={{ 
          fill: isHovered ? 'hsl(45, 25%, 75%)' : 'hsl(222, 15%, 40%)',
        }}
        transition={{ duration: 0.5 }}
      />
      <motion.rect
        x="80" y="144" width="140" height="4"
        animate={{ fill: isHovered ? 'hsl(45, 22%, 70%)' : 'hsl(222, 13%, 38%)' }}
        transition={{ duration: 0.5 }}
      />
      <motion.rect
        x="85" y="140" width="130" height="4"
        animate={{ fill: isHovered ? 'hsl(45, 20%, 65%)' : 'hsl(222, 12%, 35%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Columns - elegant proportions */}
      {[92, 110, 128, 146, 164, 182, 200].map((x, i) => (
        <motion.g key={i}>
          <motion.rect
            x={x}
            y="88"
            width="6"
            height="52"
            animate={{ 
              fill: isHovered ? 'hsl(45, 25%, 80%)' : 'hsl(222, 15%, 45%)',
            }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          />
          {/* Capital */}
          <motion.rect
            x={x - 1}
            y="85"
            width="8"
            height="3"
            animate={{ fill: isHovered ? 'hsl(45, 28%, 82%)' : 'hsl(222, 16%, 48%)' }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          />
        </motion.g>
      ))}

      {/* Entablature */}
      <motion.rect
        x="85" y="80" width="130" height="5"
        animate={{ 
          fill: isHovered ? 'hsl(45, 25%, 78%)' : 'hsl(222, 14%, 43%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Frieze line */}
      <motion.rect
        x="85" y="76" width="130" height="4"
        animate={{ fill: isHovered ? 'hsl(45, 22%, 72%)' : 'hsl(222, 12%, 40%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Pediment */}
      <motion.path
        d="M85 76 L150 50 L215 76 Z"
        animate={{ 
          fill: isHovered ? 'hsl(45, 25%, 80%)' : 'hsl(222, 14%, 45%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Inner pediment shadow */}
      <motion.path
        d="M95 74 L150 55 L205 74 Z"
        animate={{ fill: isHovered ? 'hsl(45, 18%, 68%)' : 'hsl(222, 10%, 38%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Gold accent line on hover */}
      <motion.line
        x1="85"
        y1="80"
        x2="215"
        y2="80"
        strokeWidth="1"
        animate={{ 
          stroke: isHovered ? 'hsl(45, 60%, 60%)' : 'transparent',
          opacity: isHovered ? 0.8 : 0
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Subtle glow */}
      <motion.ellipse
        cx="150"
        cy="110"
        rx="80"
        ry="50"
        fill="hsl(45, 50%, 60%)"
        animate={{ opacity: isHovered ? 0.08 : 0 }}
        transition={{ duration: 0.6 }}
      />
    </motion.svg>
  );
};

export default ParthenonSVG;

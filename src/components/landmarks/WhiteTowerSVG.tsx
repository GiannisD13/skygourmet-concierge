import { motion } from 'framer-motion';

interface WhiteTowerSVGProps {
  isHovered: boolean;
}

const WhiteTowerSVG = ({ isHovered }: WhiteTowerSVGProps) => {
  return (
    <motion.svg
      viewBox="0 0 300 200"
      className="w-full h-full"
      initial={false}
    >
      <defs>
        <linearGradient id="skySkg" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(210, 30%, 15%)' : 'hsl(222, 20%, 10%)' }}
            transition={{ duration: 0.6 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(210, 25%, 25%)' : 'hsl(222, 18%, 18%)' }}
            transition={{ duration: 0.6 }}
          />
        </linearGradient>
        <linearGradient id="seaSkg" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(210, 40%, 25%)' : 'hsl(222, 25%, 15%)' }}
            transition={{ duration: 0.6 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(210, 45%, 18%)' : 'hsl(222, 30%, 12%)' }}
            transition={{ duration: 0.6 }}
          />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="200" fill="url(#skySkg)" />

      {/* Subtle stars */}
      {[
        { x: 35, y: 25 }, { x: 90, y: 35 }, { x: 220, y: 28 }, { x: 270, y: 42 }
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r="1"
          fill="hsl(45, 30%, 80%)"
          animate={{ opacity: isHovered ? [0.4, 0.8, 0.4] : 0.3 }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* Sea */}
      <rect x="0" y="160" width="300" height="40" fill="url(#seaSkg)" />

      {/* Subtle wave lines */}
      {[0, 1].map((i) => (
        <motion.line
          key={i}
          x1="0"
          y1={170 + i * 12}
          x2="300"
          y2={170 + i * 12}
          stroke="hsl(210, 30%, 40%)"
          strokeWidth="0.5"
          animate={{ opacity: isHovered ? 0.4 : 0.2 }}
          transition={{ duration: 0.5 }}
        />
      ))}

      {/* Promenade */}
      <motion.rect
        x="0" y="155" width="300" height="6"
        animate={{ fill: isHovered ? 'hsl(35, 20%, 35%)' : 'hsl(222, 12%, 22%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Tower base */}
      <motion.rect
        x="130" y="145" width="40" height="12"
        animate={{ 
          fill: isHovered ? 'hsl(0, 0%, 92%)' : 'hsl(222, 12%, 50%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Tower main body */}
      <motion.rect
        x="133" y="85" width="34" height="60"
        animate={{ 
          fill: isHovered ? 'hsl(0, 0%, 95%)' : 'hsl(222, 12%, 55%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Windows - minimal grid */}
      {[0, 1, 2].map((row) => (
        [0, 1].map((col) => (
          <motion.rect
            key={`${row}-${col}`}
            x={140 + col * 14}
            y={92 + row * 18}
            width="5"
            height="10"
            rx="2.5"
            animate={{ 
              fill: isHovered ? 'hsl(45, 50%, 55%)' : 'hsl(222, 15%, 35%)',
            }}
            transition={{ duration: 0.4, delay: (row * 2 + col) * 0.05 }}
          />
        ))
      ))}

      {/* Battlements - simplified */}
      {[0, 1, 2, 3].map((i) => (
        <motion.rect
          key={i}
          x={135 + i * 8}
          y="80"
          width="6"
          height="6"
          animate={{ fill: isHovered ? 'hsl(0, 0%, 92%)' : 'hsl(222, 12%, 52%)' }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
        />
      ))}

      {/* Upper section */}
      <motion.rect
        x="140" y="55" width="20" height="26"
        animate={{ 
          fill: isHovered ? 'hsl(0, 0%, 95%)' : 'hsl(222, 12%, 55%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Upper window */}
      <motion.rect
        x="147" y="62" width="5" height="10" rx="2.5"
        animate={{ fill: isHovered ? 'hsl(45, 50%, 55%)' : 'hsl(222, 15%, 35%)' }}
        transition={{ duration: 0.4 }}
      />

      {/* Upper battlements */}
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={141 + i * 7}
          y="50"
          width="5"
          height="5"
          animate={{ fill: isHovered ? 'hsl(0, 0%, 92%)' : 'hsl(222, 12%, 52%)' }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
        />
      ))}

      {/* Conical roof */}
      <motion.path
        d="M140 52 L150 35 L160 52 Z"
        animate={{ 
          fill: isHovered ? 'hsl(15, 35%, 40%)' : 'hsl(222, 15%, 38%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Flag pole */}
      <motion.line
        x1="150" y1="35" x2="150" y2="22"
        strokeWidth="1.5"
        animate={{ stroke: isHovered ? 'hsl(0, 0%, 85%)' : 'hsl(222, 12%, 45%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Minimal flag */}
      <motion.rect
        x="150" y="22" width="10" height="6"
        animate={{ fill: isHovered ? 'hsl(210, 60%, 45%)' : 'hsl(222, 20%, 35%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Moon reflection */}
      <motion.ellipse
        cx="150" cy="175" rx="20" ry="4"
        fill="hsl(0, 0%, 90%)"
        animate={{ opacity: isHovered ? 0.15 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Subtle glow */}
      <motion.ellipse
        cx="150" cy="100" rx="45" ry="60"
        fill="hsl(0, 0%, 100%)"
        animate={{ opacity: isHovered ? 0.06 : 0 }}
        transition={{ duration: 0.6 }}
      />
    </motion.svg>
  );
};

export default WhiteTowerSVG;

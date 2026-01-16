import { motion } from 'framer-motion';

interface ParthenonSVGProps {
  isHovered: boolean;
}

const ParthenonSVG = ({ isHovered }: ParthenonSVGProps) => {
  return (
    <motion.svg
      viewBox="0 0 300 180"
      className="w-full h-full"
      initial={false}
    >
      {/* Clean background - no sky effects */}
      <rect width="300" height="180" fill="transparent" />

      {/* Base platform - three elegant steps */}
      <motion.rect
        x="55" y="145" width="190" height="3"
        animate={{ fill: isHovered ? 'hsl(45, 40%, 55%)' : 'hsl(0, 0%, 30%)' }}
        transition={{ duration: 0.5 }}
      />
      <motion.rect
        x="60" y="140" width="180" height="3"
        animate={{ fill: isHovered ? 'hsl(45, 38%, 50%)' : 'hsl(0, 0%, 28%)' }}
        transition={{ duration: 0.5 }}
      />
      <motion.rect
        x="65" y="135" width="170" height="3"
        animate={{ fill: isHovered ? 'hsl(45, 35%, 45%)' : 'hsl(0, 0%, 25%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Columns - refined proportions */}
      {[72, 92, 112, 132, 152, 172, 192, 212].map((x, i) => (
        <motion.g key={i}>
          {/* Column shaft */}
          <motion.rect
            x={x}
            y="68"
            width="5"
            height="67"
            animate={{ fill: isHovered ? 'hsl(45, 35%, 58%)' : 'hsl(0, 0%, 32%)' }}
            transition={{ duration: 0.4, delay: i * 0.02 }}
          />
          {/* Capital */}
          <motion.rect
            x={x - 1}
            y="65"
            width="7"
            height="3"
            animate={{ fill: isHovered ? 'hsl(45, 38%, 62%)' : 'hsl(0, 0%, 35%)' }}
            transition={{ duration: 0.4, delay: i * 0.02 }}
          />
        </motion.g>
      ))}

      {/* Entablature */}
      <motion.rect
        x="65" y="58" width="170" height="7"
        animate={{ fill: isHovered ? 'hsl(45, 35%, 55%)' : 'hsl(0, 0%, 30%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Pediment */}
      <motion.path
        d="M65 58 L150 28 L235 58 Z"
        animate={{ fill: isHovered ? 'hsl(45, 38%, 58%)' : 'hsl(0, 0%, 32%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Inner pediment shadow */}
      <motion.path
        d="M80 56 L150 35 L220 56 Z"
        animate={{ fill: isHovered ? 'hsl(45, 30%, 45%)' : 'hsl(0, 0%, 22%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Gold accent line */}
      <motion.line
        x1="65" y1="58" x2="235" y2="58"
        strokeWidth="1"
        animate={{ 
          stroke: isHovered ? 'hsl(45, 50%, 55%)' : 'transparent',
          opacity: isHovered ? 0.8 : 0
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.svg>
  );
};

export default ParthenonSVG;

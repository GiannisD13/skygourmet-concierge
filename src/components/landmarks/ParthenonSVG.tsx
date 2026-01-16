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
      {/* Sky gradient background */}
      <defs>
        <linearGradient id="skyGradientAth" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(220, 50%, 20%)' : 'hsl(220, 30%, 15%)' }}
            transition={{ duration: 0.5 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(35, 60%, 30%)' : 'hsl(220, 25%, 25%)' }}
            transition={{ duration: 0.5 }}
          />
        </linearGradient>
        <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(45, 80%, 60%)" />
          <stop offset="50%" stopColor="hsl(45, 90%, 70%)" />
          <stop offset="100%" stopColor="hsl(45, 80%, 55%)" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="200" fill="url(#skyGradientAth)" />

      {/* Stars */}
      {[
        { x: 30, y: 25 }, { x: 80, y: 40 }, { x: 140, y: 20 },
        { x: 200, y: 35 }, { x: 260, y: 28 }, { x: 45, y: 55 },
        { x: 180, y: 50 }, { x: 240, y: 60 }
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r="1.5"
          fill="white"
          animate={{ opacity: isHovered ? [0.3, 1, 0.3] : 0.4 }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      {/* Hill/Acropolis base */}
      <motion.path
        d="M0 180 Q50 160 100 165 Q150 155 200 160 Q250 155 300 165 L300 200 L0 200 Z"
        animate={{ fill: isHovered ? 'hsl(35, 25%, 35%)' : 'hsl(220, 15%, 25%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Parthenon Base Platform */}
      <motion.rect
        x="60"
        y="130"
        width="180"
        height="10"
        animate={{ 
          fill: isHovered ? 'hsl(45, 70%, 65%)' : 'hsl(220, 20%, 50%)',
          filter: isHovered ? 'drop-shadow(0 0 8px hsl(45, 80%, 50%))' : 'none'
        }}
        transition={{ duration: 0.4 }}
      />
      <motion.rect
        x="65"
        y="125"
        width="170"
        height="6"
        animate={{ fill: isHovered ? 'hsl(45, 65%, 60%)' : 'hsl(220, 18%, 45%)' }}
        transition={{ duration: 0.4 }}
      />
      <motion.rect
        x="70"
        y="121"
        width="160"
        height="5"
        animate={{ fill: isHovered ? 'hsl(45, 60%, 55%)' : 'hsl(220, 16%, 40%)' }}
        transition={{ duration: 0.4 }}
      />

      {/* Columns */}
      {[75, 95, 115, 135, 155, 175, 195, 215].map((x, i) => (
        <motion.g key={i}>
          {/* Column shaft */}
          <motion.rect
            x={x}
            y="75"
            width="10"
            height="46"
            rx="1"
            animate={{ 
              fill: isHovered ? 'hsl(45, 70%, 68%)' : 'hsl(220, 20%, 55%)',
              filter: isHovered ? 'drop-shadow(0 0 6px hsl(45, 80%, 50%))' : 'none'
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
          {/* Column capital */}
          <motion.rect
            x={x - 2}
            y="72"
            width="14"
            height="4"
            animate={{ fill: isHovered ? 'hsl(45, 75%, 70%)' : 'hsl(220, 22%, 58%)' }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
          {/* Column base */}
          <motion.rect
            x={x - 1}
            y="120"
            width="12"
            height="3"
            animate={{ fill: isHovered ? 'hsl(45, 65%, 62%)' : 'hsl(220, 18%, 50%)' }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        </motion.g>
      ))}

      {/* Architrave (beam above columns) */}
      <motion.rect
        x="70"
        y="68"
        width="160"
        height="5"
        animate={{ 
          fill: isHovered ? 'hsl(45, 72%, 67%)' : 'hsl(220, 22%, 52%)',
          filter: isHovered ? 'drop-shadow(0 0 8px hsl(45, 80%, 50%))' : 'none'
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Frieze */}
      <motion.rect
        x="70"
        y="62"
        width="160"
        height="7"
        animate={{ fill: isHovered ? 'hsl(45, 68%, 63%)' : 'hsl(220, 20%, 48%)' }}
        transition={{ duration: 0.4 }}
      />

      {/* Triangular Pediment */}
      <motion.path
        d="M70 62 L150 35 L230 62 Z"
        animate={{ 
          fill: isHovered ? 'hsl(45, 75%, 70%)' : 'hsl(220, 22%, 55%)',
          filter: isHovered ? 'drop-shadow(0 0 10px hsl(45, 80%, 50%))' : 'none'
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Pediment inner detail */}
      <motion.path
        d="M85 60 L150 42 L215 60 Z"
        animate={{ fill: isHovered ? 'hsl(45, 60%, 55%)' : 'hsl(220, 18%, 45%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Glow effect on hover */}
      {isHovered && (
        <motion.ellipse
          cx="150"
          cy="100"
          rx="100"
          ry="60"
          fill="hsl(45, 80%, 50%)"
          opacity="0.1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.svg>
  );
};

export default ParthenonSVG;

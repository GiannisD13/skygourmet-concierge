import { motion } from 'framer-motion';

interface WhiteTowerSVGProps {
  isHovered: boolean;
}

const WhiteTowerSVG = ({ isHovered }: WhiteTowerSVGProps) => {
  return (
    <motion.svg
      viewBox="0 0 300 180"
      className="w-full h-full"
      initial={false}
    >
      {/* Clean background */}
      <rect width="300" height="180" fill="transparent" />

      {/* Ground line */}
      <motion.line
        x1="80" y1="155" x2="220" y2="155"
        strokeWidth="1"
        animate={{ stroke: isHovered ? 'hsl(45, 30%, 40%)' : 'hsl(0, 0%, 25%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Tower base */}
      <motion.rect
        x="125" y="145" width="50" height="10"
        animate={{ fill: isHovered ? 'hsl(45, 25%, 65%)' : 'hsl(0, 0%, 38%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Tower main body */}
      <motion.rect
        x="130" y="70" width="40" height="75"
        animate={{ fill: isHovered ? 'hsl(45, 20%, 70%)' : 'hsl(0, 0%, 42%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Windows - elegant grid */}
      {[0, 1, 2].map((row) => (
        [0, 1].map((col) => (
          <motion.rect
            key={`${row}-${col}`}
            x={138 + col * 16}
            y={78 + row * 22}
            width="5"
            height="12"
            rx="2.5"
            animate={{ fill: isHovered ? 'hsl(45, 45%, 50%)' : 'hsl(0, 0%, 25%)' }}
            transition={{ duration: 0.4, delay: (row * 2 + col) * 0.03 }}
          />
        ))
      ))}

      {/* Battlements */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.rect
          key={i}
          x={131 + i * 8}
          y="64"
          width="6"
          height="6"
          animate={{ fill: isHovered ? 'hsl(45, 20%, 68%)' : 'hsl(0, 0%, 40%)' }}
          transition={{ duration: 0.4, delay: i * 0.02 }}
        />
      ))}

      {/* Upper section */}
      <motion.rect
        x="138" y="40" width="24" height="26"
        animate={{ fill: isHovered ? 'hsl(45, 20%, 70%)' : 'hsl(0, 0%, 42%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Upper window */}
      <motion.rect
        x="147" y="48" width="5" height="10" rx="2.5"
        animate={{ fill: isHovered ? 'hsl(45, 45%, 50%)' : 'hsl(0, 0%, 25%)' }}
        transition={{ duration: 0.4 }}
      />

      {/* Upper battlements */}
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={139 + i * 8}
          y="35"
          width="5"
          height="5"
          animate={{ fill: isHovered ? 'hsl(45, 20%, 68%)' : 'hsl(0, 0%, 40%)' }}
          transition={{ duration: 0.4, delay: i * 0.02 }}
        />
      ))}

      {/* Conical roof */}
      <motion.path
        d="M138 37 L150 18 L162 37 Z"
        animate={{ fill: isHovered ? 'hsl(45, 30%, 45%)' : 'hsl(0, 0%, 30%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Flag pole */}
      <motion.line
        x1="150" y1="18" x2="150" y2="8"
        strokeWidth="1"
        animate={{ stroke: isHovered ? 'hsl(45, 40%, 60%)' : 'hsl(0, 0%, 45%)' }}
        transition={{ duration: 0.5 }}
      />
    </motion.svg>
  );
};

export default WhiteTowerSVG;

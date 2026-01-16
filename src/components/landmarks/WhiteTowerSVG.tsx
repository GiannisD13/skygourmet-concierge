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
      {/* Sky and sea gradient */}
      <defs>
        <linearGradient id="skyGradientSkg" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(200, 60%, 25%)' : 'hsl(220, 30%, 15%)' }}
            transition={{ duration: 0.5 }}
          />
          <motion.stop
            offset="60%"
            animate={{ stopColor: isHovered ? 'hsl(200, 50%, 35%)' : 'hsl(220, 25%, 25%)' }}
            transition={{ duration: 0.5 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(200, 70%, 40%)' : 'hsl(220, 30%, 30%)' }}
            transition={{ duration: 0.5 }}
          />
        </linearGradient>
        <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(200, 60%, 35%)' : 'hsl(220, 40%, 25%)' }}
            transition={{ duration: 0.5 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(200, 70%, 25%)' : 'hsl(220, 45%, 18%)' }}
            transition={{ duration: 0.5 }}
          />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="200" fill="url(#skyGradientSkg)" />

      {/* Stars */}
      {[
        { x: 25, y: 20 }, { x: 70, y: 35 }, { x: 120, y: 15 },
        { x: 220, y: 25 }, { x: 270, y: 40 }, { x: 40, y: 50 }
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r="1.5"
          fill="white"
          animate={{ opacity: isHovered ? [0.3, 1, 0.3] : 0.4 }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Sea */}
      <motion.rect
        x="0"
        y="160"
        width="300"
        height="40"
        fill="url(#seaGradient)"
      />

      {/* Sea waves */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M0 ${165 + i * 12} Q30 ${162 + i * 12} 60 ${165 + i * 12} Q90 ${168 + i * 12} 120 ${165 + i * 12} Q150 ${162 + i * 12} 180 ${165 + i * 12} Q210 ${168 + i * 12} 240 ${165 + i * 12} Q270 ${162 + i * 12} 300 ${165 + i * 12}`}
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          animate={{ 
            opacity: isHovered ? 0.4 : 0.2,
            x: [0, 10, 0]
          }}
          transition={{ 
            x: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 }
          }}
        />
      ))}

      {/* Promenade/Ground */}
      <motion.rect
        x="0"
        y="155"
        width="300"
        height="8"
        animate={{ fill: isHovered ? 'hsl(35, 30%, 45%)' : 'hsl(220, 15%, 30%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Tower Base */}
      <motion.rect
        x="115"
        y="140"
        width="70"
        height="18"
        animate={{ 
          fill: isHovered ? 'hsl(0, 0%, 95%)' : 'hsl(220, 15%, 60%)',
          filter: isHovered ? 'drop-shadow(0 0 15px hsl(0, 0%, 100%))' : 'none'
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Tower Main Body */}
      <motion.rect
        x="120"
        y="75"
        width="60"
        height="65"
        animate={{ 
          fill: isHovered ? 'hsl(0, 0%, 98%)' : 'hsl(220, 15%, 65%)',
          filter: isHovered ? 'drop-shadow(0 0 20px hsl(0, 0%, 100%))' : 'none'
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Tower Windows - Main Body */}
      {[0, 1, 2].map((row) => (
        [0, 1, 2].map((col) => (
          <motion.rect
            key={`${row}-${col}`}
            x={128 + col * 18}
            y={82 + row * 20}
            width="8"
            height="12"
            rx="4"
            animate={{ 
              fill: isHovered ? 'hsl(45, 80%, 60%)' : 'hsl(220, 20%, 40%)',
              filter: isHovered ? 'drop-shadow(0 0 4px hsl(45, 80%, 50%))' : 'none'
            }}
            transition={{ duration: 0.3, delay: (row * 3 + col) * 0.05 }}
          />
        ))
      ))}

      {/* Tower Battlements */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.rect
          key={i}
          x={122 + i * 10}
          y="68"
          width="8"
          height="8"
          animate={{ fill: isHovered ? 'hsl(0, 0%, 95%)' : 'hsl(220, 15%, 60%)' }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        />
      ))}

      {/* Tower Upper Section */}
      <motion.rect
        x="128"
        y="45"
        width="44"
        height="25"
        animate={{ 
          fill: isHovered ? 'hsl(0, 0%, 98%)' : 'hsl(220, 15%, 65%)',
          filter: isHovered ? 'drop-shadow(0 0 15px hsl(0, 0%, 100%))' : 'none'
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Upper Windows */}
      {[0, 1].map((col) => (
        <motion.rect
          key={col}
          x={136 + col * 18}
          y="52"
          width="8"
          height="12"
          rx="4"
          animate={{ 
            fill: isHovered ? 'hsl(45, 80%, 60%)' : 'hsl(220, 20%, 40%)',
            filter: isHovered ? 'drop-shadow(0 0 4px hsl(45, 80%, 50%))' : 'none'
          }}
          transition={{ duration: 0.3, delay: col * 0.1 }}
        />
      ))}

      {/* Upper Battlements */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.rect
          key={i}
          x={129 + i * 9}
          y="38"
          width="7"
          height="8"
          animate={{ fill: isHovered ? 'hsl(0, 0%, 95%)' : 'hsl(220, 15%, 60%)' }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        />
      ))}

      {/* Conical Roof */}
      <motion.path
        d="M128 40 L150 18 L172 40 Z"
        animate={{ 
          fill: isHovered ? 'hsl(15, 60%, 45%)' : 'hsl(220, 20%, 40%)',
          filter: isHovered ? 'drop-shadow(0 0 8px hsl(15, 60%, 50%))' : 'none'
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Flag Pole */}
      <motion.line
        x1="150"
        y1="18"
        x2="150"
        y2="5"
        strokeWidth="2"
        animate={{ stroke: isHovered ? 'hsl(0, 0%, 90%)' : 'hsl(220, 15%, 50%)' }}
        transition={{ duration: 0.4 }}
      />

      {/* Greek Flag */}
      <motion.g animate={{ x: isHovered ? [0, 2, 0] : 0 }} transition={{ duration: 1, repeat: Infinity }}>
        <rect x="150" y="5" width="12" height="8" fill={isHovered ? 'hsl(210, 80%, 50%)' : 'hsl(220, 30%, 40%)'} />
        <rect x="150" y="5" width="4" height="8" fill="white" opacity={isHovered ? 1 : 0.5} />
        <rect x="150" y="8" width="12" height="2" fill="white" opacity={isHovered ? 1 : 0.5} />
      </motion.g>

      {/* Moon reflection on water */}
      {isHovered && (
        <motion.ellipse
          cx="150"
          cy="175"
          rx="30"
          ry="8"
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Glow effect */}
      {isHovered && (
        <motion.ellipse
          cx="150"
          cy="100"
          rx="60"
          ry="80"
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.svg>
  );
};

export default WhiteTowerSVG;

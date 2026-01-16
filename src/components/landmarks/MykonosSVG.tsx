import { motion } from 'framer-motion';

interface MykonosSVGProps {
  isHovered: boolean;
}

const MykonosSVG = ({ isHovered }: MykonosSVGProps) => {
  return (
    <motion.svg
      viewBox="0 0 300 200"
      className="w-full h-full"
      initial={false}
    >
      <defs>
        <linearGradient id="skyMyk" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(210, 45%, 50%)' : 'hsl(222, 20%, 10%)' }}
            transition={{ duration: 0.6 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(200, 50%, 60%)' : 'hsl(222, 18%, 18%)' }}
            transition={{ duration: 0.6 }}
          />
        </linearGradient>
        <linearGradient id="seaMyk" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(200, 60%, 50%)' : 'hsl(222, 30%, 20%)' }}
            transition={{ duration: 0.6 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(205, 65%, 40%)' : 'hsl(222, 35%, 15%)' }}
            transition={{ duration: 0.6 }}
          />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="200" fill="url(#skyMyk)" />

      {/* Sun/Moon */}
      <motion.circle
        cx="250"
        cy="40"
        r="15"
        animate={{ 
          fill: isHovered ? 'hsl(45, 90%, 65%)' : 'hsl(45, 20%, 60%)',
          opacity: isHovered ? 1 : 0.4
        }}
        transition={{ duration: 0.6 }}
      />

      {/* Stars (night mode) */}
      {[
        { x: 40, y: 30 }, { x: 100, y: 22 }, { x: 160, y: 35 }
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r="1"
          fill="hsl(45, 30%, 80%)"
          animate={{ opacity: isHovered ? 0 : 0.5 }}
          transition={{ duration: 0.5 }}
        />
      ))}

      {/* Sea */}
      <rect x="0" y="150" width="300" height="50" fill="url(#seaMyk)" />

      {/* Subtle wave line */}
      <motion.line
        x1="0" y1="165" x2="300" y2="165"
        stroke="hsl(200, 40%, 70%)"
        strokeWidth="0.5"
        animate={{ opacity: isHovered ? 0.3 : 0.15 }}
        transition={{ duration: 0.5 }}
      />

      {/* Island hillside */}
      <motion.path
        d="M0 165 Q50 145 100 150 Q150 135 200 145 Q250 138 300 150 L300 200 L0 200 Z"
        animate={{ fill: isHovered ? 'hsl(40, 25%, 65%)' : 'hsl(222, 12%, 25%)' }}
        transition={{ duration: 0.6 }}
      />

      {/* Cycladic houses - minimal cubes */}
      {[
        { x: 35, y: 140, w: 18, h: 14 },
        { x: 58, y: 137, w: 15, h: 17 },
        { x: 220, y: 142, w: 17, h: 13 },
        { x: 242, y: 138, w: 16, h: 17 },
      ].map((house, i) => (
        <motion.g key={i}>
          <motion.rect
            x={house.x}
            y={house.y}
            width={house.w}
            height={house.h}
            animate={{ 
              fill: isHovered ? 'hsl(0, 0%, 98%)' : 'hsl(222, 12%, 45%)',
            }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          />
          {/* Blue accent door */}
          <motion.rect
            x={house.x + house.w / 2 - 2}
            y={house.y + house.h - 5}
            width="4"
            height="5"
            animate={{ fill: isHovered ? 'hsl(210, 60%, 45%)' : 'hsl(222, 25%, 35%)' }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          />
        </motion.g>
      ))}

      {/* Windmill - refined silhouette */}
      <motion.g>
        {/* Body - tapered cylinder */}
        <motion.path
          d="M138 90 L145 155 L165 155 L162 90 Z"
          animate={{ 
            fill: isHovered ? 'hsl(0, 0%, 98%)' : 'hsl(222, 12%, 50%)',
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Roof */}
        <motion.path
          d="M135 92 L150 75 L165 92 Z"
          animate={{ 
            fill: isHovered ? 'hsl(25, 30%, 40%)' : 'hsl(222, 15%, 38%)',
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Door */}
        <motion.path
          d="M151 155 L151 142 Q155 138 159 142 L159 155 Z"
          animate={{ fill: isHovered ? 'hsl(25, 25%, 32%)' : 'hsl(222, 18%, 30%)' }}
          transition={{ duration: 0.5 }}
        />

        {/* Blades hub */}
        <motion.circle
          cx="150"
          cy="85"
          r="3"
          animate={{ fill: isHovered ? 'hsl(25, 25%, 35%)' : 'hsl(222, 15%, 40%)' }}
          transition={{ duration: 0.5 }}
        />

        {/* Elegant rotating blades */}
        <motion.g
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '150px 85px' }}
        >
          {[0, 90, 180, 270].map((angle, i) => (
            <motion.line
              key={i}
              x1="150"
              y1="85"
              x2={150 + Math.cos((angle - 90) * Math.PI / 180) * 35}
              y2={85 + Math.sin((angle - 90) * Math.PI / 180) * 35}
              strokeWidth="2"
              animate={{ stroke: isHovered ? 'hsl(25, 20%, 45%)' : 'hsl(222, 12%, 45%)' }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </motion.g>
      </motion.g>

      {/* Small church - minimal dome */}
      <motion.g>
        <motion.rect
          x="95" y="130" width="14" height="15"
          animate={{ fill: isHovered ? 'hsl(0, 0%, 98%)' : 'hsl(222, 12%, 45%)' }}
          transition={{ duration: 0.5 }}
        />
        <motion.ellipse
          cx="102" cy="130" rx="7" ry="5"
          animate={{ 
            fill: isHovered ? 'hsl(210, 60%, 45%)' : 'hsl(222, 25%, 38%)',
          }}
          transition={{ duration: 0.5 }}
        />
        {/* Cross */}
        <motion.line
          x1="102" y1="120" x2="102" y2="126"
          strokeWidth="1.5"
          animate={{ stroke: isHovered ? 'hsl(45, 60%, 55%)' : 'hsl(222, 15%, 45%)' }}
          transition={{ duration: 0.5 }}
        />
        <motion.line
          x1="99" y1="122" x2="105" y2="122"
          strokeWidth="1.5"
          animate={{ stroke: isHovered ? 'hsl(45, 60%, 55%)' : 'hsl(222, 15%, 45%)' }}
          transition={{ duration: 0.5 }}
        />
      </motion.g>

      {/* Sun reflection on water */}
      <motion.ellipse
        cx="250" cy="168" rx="18" ry="5"
        fill="hsl(45, 80%, 65%)"
        animate={{ opacity: isHovered ? 0.25 : 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Subtle glow */}
      <motion.ellipse
        cx="150" cy="120" rx="60" ry="40"
        fill="hsl(45, 50%, 60%)"
        animate={{ opacity: isHovered ? 0.05 : 0 }}
        transition={{ duration: 0.6 }}
      />
    </motion.svg>
  );
};

export default MykonosSVG;

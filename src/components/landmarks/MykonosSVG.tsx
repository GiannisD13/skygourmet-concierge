import { motion } from 'framer-motion';

interface MykonosSVGProps {
  isHovered: boolean;
}

const MykonosSVG = ({ isHovered }: MykonosSVGProps) => {
  return (
    <motion.svg
      viewBox="0 0 300 180"
      className="w-full h-full"
      initial={false}
    >
      {/* Clean background */}
      <rect width="300" height="180" fill="transparent" />

      {/* Subtle horizon line */}
      <motion.line
        x1="40" y1="135" x2="260" y2="135"
        strokeWidth="0.5"
        animate={{ stroke: isHovered ? 'hsl(45, 30%, 35%)' : 'hsl(0, 0%, 22%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* Island hillside - minimal curve */}
      <motion.path
        d="M50 155 Q100 140 150 145 Q200 135 250 145 L250 180 L50 180 Z"
        animate={{ fill: isHovered ? 'hsl(45, 15%, 30%)' : 'hsl(0, 0%, 18%)' }}
        transition={{ duration: 0.6 }}
      />

      {/* Cycladic houses - minimal cubes */}
      {[
        { x: 60, y: 138, w: 16, h: 12 },
        { x: 80, y: 135, w: 14, h: 15 },
        { x: 200, y: 140, w: 15, h: 11 },
        { x: 220, y: 136, w: 14, h: 14 },
      ].map((house, i) => (
        <motion.rect
          key={i}
          x={house.x}
          y={house.y}
          width={house.w}
          height={house.h}
          animate={{ fill: isHovered ? 'hsl(45, 15%, 65%)' : 'hsl(0, 0%, 40%)' }}
          transition={{ duration: 0.4, delay: i * 0.03 }}
        />
      ))}

      {/* Windmill - elegant silhouette */}
      <motion.g>
        {/* Body - tapered */}
        <motion.path
          d="M138 80 L143 150 L167 150 L162 80 Z"
          animate={{ fill: isHovered ? 'hsl(45, 18%, 68%)' : 'hsl(0, 0%, 45%)' }}
          transition={{ duration: 0.5 }}
        />

        {/* Roof */}
        <motion.path
          d="M135 82 L150 62 L165 82 Z"
          animate={{ fill: isHovered ? 'hsl(45, 25%, 42%)' : 'hsl(0, 0%, 30%)' }}
          transition={{ duration: 0.5 }}
        />

        {/* Blades hub */}
        <motion.circle
          cx="150"
          cy="75"
          r="3"
          animate={{ fill: isHovered ? 'hsl(45, 30%, 40%)' : 'hsl(0, 0%, 28%)' }}
          transition={{ duration: 0.5 }}
        />

        {/* Elegant rotating blades - thin lines */}
        <motion.g
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '150px 75px' }}
        >
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <motion.line
              key={i}
              x1="150"
              y1="75"
              x2={150 + Math.cos((angle - 90) * Math.PI / 180) * 38}
              y2={75 + Math.sin((angle - 90) * Math.PI / 180) * 38}
              strokeWidth="1.5"
              animate={{ stroke: isHovered ? 'hsl(45, 25%, 48%)' : 'hsl(0, 0%, 35%)' }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </motion.g>
      </motion.g>

      {/* Small church dome - minimal */}
      <motion.g>
        <motion.rect
          x="105" y="128" width="12" height="12"
          animate={{ fill: isHovered ? 'hsl(45, 15%, 65%)' : 'hsl(0, 0%, 40%)' }}
          transition={{ duration: 0.5 }}
        />
        <motion.ellipse
          cx="111" cy="128" rx="6" ry="4"
          animate={{ fill: isHovered ? 'hsl(45, 20%, 50%)' : 'hsl(0, 0%, 32%)' }}
          transition={{ duration: 0.5 }}
        />
        {/* Cross */}
        <motion.line
          x1="111" y1="119" x2="111" y2="125"
          strokeWidth="1"
          animate={{ stroke: isHovered ? 'hsl(45, 50%, 55%)' : 'hsl(0, 0%, 40%)' }}
          transition={{ duration: 0.5 }}
        />
        <motion.line
          x1="108" y1="121" x2="114" y2="121"
          strokeWidth="1"
          animate={{ stroke: isHovered ? 'hsl(45, 50%, 55%)' : 'hsl(0, 0%, 40%)' }}
          transition={{ duration: 0.5 }}
        />
      </motion.g>
    </motion.svg>
  );
};

export default MykonosSVG;

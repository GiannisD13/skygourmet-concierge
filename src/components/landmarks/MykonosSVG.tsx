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
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="skyGradientMyk" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(210, 80%, 55%)' : 'hsl(220, 30%, 15%)' }}
            transition={{ duration: 0.5 }}
          />
          <motion.stop
            offset="50%"
            animate={{ stopColor: isHovered ? 'hsl(200, 70%, 65%)' : 'hsl(220, 25%, 25%)' }}
            transition={{ duration: 0.5 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(195, 80%, 70%)' : 'hsl(220, 30%, 35%)' }}
            transition={{ duration: 0.5 }}
          />
        </linearGradient>
        <linearGradient id="seaGradientMyk" x1="0%" y1="0%" x2="0%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{ stopColor: isHovered ? 'hsl(195, 90%, 55%)' : 'hsl(220, 40%, 30%)' }}
            transition={{ duration: 0.5 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: isHovered ? 'hsl(200, 85%, 45%)' : 'hsl(220, 45%, 20%)' }}
            transition={{ duration: 0.5 }}
          />
        </linearGradient>
      </defs>

      {/* Background Sky */}
      <rect width="300" height="200" fill="url(#skyGradientMyk)" />

      {/* Sun */}
      <motion.circle
        cx="250"
        cy="45"
        r="20"
        animate={{ 
          fill: isHovered ? 'hsl(45, 100%, 60%)' : 'hsl(220, 20%, 50%)',
          filter: isHovered ? 'drop-shadow(0 0 20px hsl(45, 100%, 50%))' : 'none'
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Stars (visible only when not hovered - night mode) */}
      {[
        { x: 30, y: 25 }, { x: 80, y: 40 }, { x: 140, y: 20 },
        { x: 45, y: 55 }, { x: 100, y: 60 }
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r="1.5"
          fill="white"
          animate={{ opacity: isHovered ? 0 : 0.6 }}
          transition={{ duration: 0.5 }}
        />
      ))}

      {/* Sea */}
      <motion.rect
        x="0"
        y="145"
        width="300"
        height="55"
        fill="url(#seaGradientMyk)"
      />

      {/* Sea waves */}
      {[0, 1, 2, 3].map((i) => (
        <motion.path
          key={i}
          d={`M0 ${150 + i * 12} Q40 ${147 + i * 12} 80 ${150 + i * 12} Q120 ${153 + i * 12} 160 ${150 + i * 12} Q200 ${147 + i * 12} 240 ${150 + i * 12} Q280 ${153 + i * 12} 320 ${150 + i * 12}`}
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          animate={{ 
            opacity: isHovered ? 0.5 : 0.2,
            x: [0, -20, 0]
          }}
          transition={{ 
            x: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 }
          }}
        />
      ))}

      {/* Island hillside */}
      <motion.path
        d="M0 160 Q30 140 70 145 Q100 130 140 140 Q180 125 220 135 Q260 128 300 145 L300 200 L0 200 Z"
        animate={{ fill: isHovered ? 'hsl(35, 40%, 70%)' : 'hsl(220, 15%, 35%)' }}
        transition={{ duration: 0.5 }}
      />

      {/* White Cycladic Houses */}
      {[
        { x: 20, y: 130, w: 25, h: 20 },
        { x: 50, y: 125, w: 20, h: 25 },
        { x: 75, y: 128, w: 22, h: 22 },
        { x: 200, y: 130, w: 24, h: 20 },
        { x: 228, y: 126, w: 20, h: 24 },
        { x: 255, y: 132, w: 25, h: 18 },
      ].map((house, i) => (
        <motion.g key={i}>
          {/* House body */}
          <motion.rect
            x={house.x}
            y={house.y}
            width={house.w}
            height={house.h}
            animate={{ 
              fill: isHovered ? 'hsl(0, 0%, 100%)' : 'hsl(220, 15%, 55%)',
              filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
          {/* Blue door */}
          <motion.rect
            x={house.x + house.w / 2 - 3}
            y={house.y + house.h - 8}
            width="6"
            height="8"
            animate={{ fill: isHovered ? 'hsl(210, 80%, 50%)' : 'hsl(220, 30%, 40%)' }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
          {/* Window */}
          <motion.rect
            x={house.x + 4}
            y={house.y + 5}
            width="5"
            height="5"
            animate={{ fill: isHovered ? 'hsl(210, 80%, 50%)' : 'hsl(220, 30%, 40%)' }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        </motion.g>
      ))}

      {/* Main Windmill */}
      <motion.g>
        {/* Windmill base/body */}
        <motion.path
          d="M135 75 L145 140 L175 140 L165 75 Z"
          animate={{ 
            fill: isHovered ? 'hsl(0, 0%, 100%)' : 'hsl(220, 15%, 60%)',
            filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Windmill roof */}
        <motion.path
          d="M130 78 L150 55 L170 78 Z"
          animate={{ 
            fill: isHovered ? 'hsl(25, 50%, 45%)' : 'hsl(220, 20%, 40%)',
            filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none'
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Windmill door */}
        <motion.path
          d="M152 140 L152 120 Q157 115 162 120 L162 140 Z"
          animate={{ fill: isHovered ? 'hsl(25, 40%, 35%)' : 'hsl(220, 25%, 35%)' }}
          transition={{ duration: 0.4 }}
        />

        {/* Windmill blades hub */}
        <motion.circle
          cx="150"
          cy="70"
          r="5"
          animate={{ fill: isHovered ? 'hsl(25, 40%, 40%)' : 'hsl(220, 20%, 45%)' }}
          transition={{ duration: 0.4 }}
        />

        {/* Rotating Blades */}
        <motion.g
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '150px 70px' }}
        >
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <motion.g key={i} transform={`rotate(${angle} 150 70)`}>
              {/* Blade arm */}
              <motion.rect
                x="148"
                y="25"
                width="4"
                height="42"
                animate={{ fill: isHovered ? 'hsl(25, 35%, 50%)' : 'hsl(220, 15%, 50%)' }}
                transition={{ duration: 0.4 }}
              />
              {/* Blade sail */}
              <motion.path
                d="M152 27 L165 35 L165 55 L152 65 Z"
                animate={{ 
                  fill: isHovered ? 'hsl(40, 30%, 90%)' : 'hsl(220, 10%, 55%)',
                  opacity: isHovered ? 0.9 : 0.7
                }}
                transition={{ duration: 0.4 }}
              />
            </motion.g>
          ))}
        </motion.g>
      </motion.g>

      {/* Small church dome */}
      <motion.g>
        <motion.rect
          x="100"
          y="115"
          width="18"
          height="20"
          animate={{ fill: isHovered ? 'hsl(0, 0%, 100%)' : 'hsl(220, 15%, 55%)' }}
          transition={{ duration: 0.4 }}
        />
        <motion.ellipse
          cx="109"
          cy="115"
          rx="9"
          ry="7"
          animate={{ 
            fill: isHovered ? 'hsl(210, 80%, 50%)' : 'hsl(220, 30%, 45%)',
            filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
          }}
          transition={{ duration: 0.4 }}
        />
        {/* Cross */}
        <motion.g>
          <motion.rect
            x="108"
            y="103"
            width="2"
            height="8"
            animate={{ fill: isHovered ? 'hsl(45, 80%, 50%)' : 'hsl(220, 20%, 50%)' }}
            transition={{ duration: 0.4 }}
          />
          <motion.rect
            x="105"
            y="105"
            width="8"
            height="2"
            animate={{ fill: isHovered ? 'hsl(45, 80%, 50%)' : 'hsl(220, 20%, 50%)' }}
            transition={{ duration: 0.4 }}
          />
        </motion.g>
      </motion.g>

      {/* Pelican (Petros!) */}
      {isHovered && (
        <motion.g
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Body */}
          <ellipse cx="45" cy="148" rx="12" ry="8" fill="hsl(0, 0%, 100%)" />
          {/* Head */}
          <circle cx="55" cy="140" r="5" fill="hsl(0, 0%, 100%)" />
          {/* Beak */}
          <path d="M58 140 L72 143 L58 146 Z" fill="hsl(35, 80%, 55%)" />
          {/* Eye */}
          <circle cx="56" cy="139" r="1" fill="black" />
        </motion.g>
      )}

      {/* Bougainvillea flowers */}
      {isHovered && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {[
            { x: 45, y: 123 }, { x: 48, y: 120 }, { x: 52, y: 122 },
            { x: 230, y: 124 }, { x: 234, y: 121 }, { x: 238, y: 125 }
          ].map((flower, i) => (
            <circle
              key={i}
              cx={flower.x}
              cy={flower.y}
              r="3"
              fill="hsl(330, 80%, 55%)"
            />
          ))}
        </motion.g>
      )}

      {/* Sun reflection on water */}
      {isHovered && (
        <motion.ellipse
          cx="250"
          cy="165"
          rx="25"
          ry="10"
          fill="hsl(45, 100%, 70%)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.svg>
  );
};

export default MykonosSVG;

interface SectionDividerProps {
  /** Tailwind text-color class — sets the curve fill to match the section below. */
  className?: string;
  /** Mirror the curve vertically. */
  flip?: boolean;
}

/**
 * A soft SVG curve used to transition between two dark bands.
 * Place it at the seam; the fill (currentColor) should match the next band.
 */
const SectionDivider = ({ className = 'text-background', flip = false }: SectionDividerProps) => (
  <div className={`relative -mb-px leading-[0] ${className}`} aria-hidden="true">
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`block h-[56px] w-full md:h-[96px] ${flip ? 'rotate-180' : ''}`}
    >
      <path d="M0,48 C360,128 1080,8 1440,72 L1440,120 L0,120 Z" fill="currentColor" />
    </svg>
  </div>
);

export default SectionDivider;

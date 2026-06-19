import React from "react";

interface LogoProps {
  iconClassName?: string;
  showText?: boolean;
  variant?: "light" | "dark";
  orientation?: "horizontal" | "vertical";
}

export function StellosLogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} fill-none`}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 
        This path matches the elegant calligraphic cursive "S" 
        from the logo image precisely, including the bottom loop,
        the neat curves, and the final sweeping diagonal crossing stroke.
      */}
      <path
        d="M 58 25 
           C 62 21, 51 17, 44 24 
           C 36 31, 36 43, 44 48 
           C 51 53, 58 51, 54 61 
           C 51 68, 43 71, 39 67 
           C 34 62, 38 53, 49 48 
           L 64 42"
      />
    </svg>
  );
}

export default function StellosLogo({
  iconClassName = "w-10 h-10",
  showText = true,
  variant = "dark",
  orientation = "horizontal"
}: LogoProps) {
  const isDark = variant === "dark";
  const isVertical = orientation === "vertical";

  const containerClasses = isVertical 
    ? "flex flex-col items-center text-center gap-2" 
    : "flex items-center gap-3";

  return (
    <div className={containerClasses}>
      <div 
        className={`shrink-0 flex items-center justify-center rounded-sm transition-colors duration-300
          ${isDark 
            ? "text-espresso-950 bg-transparent" 
            : "text-[#F7F4F0] bg-transparent"
          }`}
      >
        <StellosLogoIcon className={iconClassName} />
      </div>
      {showText && (
        <div className="text-left select-none">
          <span 
            className={`font-display font-medium uppercase block leading-none tracking-[0.2em]
              ${isVertical ? "text-lg text-center mt-1.5" : "text-xl"}
              ${isDark ? "text-espresso-950" : "text-[#F7F4F0]"}`}
          >
            STELLOS
          </span>
          <span 
            className={`font-mono block leading-none font-bold tracking-[0.25em] mt-1.5
              ${isVertical ? "text-[8px] text-center" : "text-[9px]"}
              ${isDark ? "text-espresso-600" : "text-amber-400"}`}
          >
            STELLENBOSCH
          </span>
        </div>
      )}
    </div>
  );
}

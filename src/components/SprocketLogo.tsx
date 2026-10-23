/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';

interface SprocketLogoProps {
  /**
   * USER CIRCLE LOGO:
   * To use your own circle image, pass your image URL/path here or replace "/rc-monogram.png".
   */
  circleLogoSrc?: string;
  className?: string;
}

export default function SprocketLogo({
  circleLogoSrc = '/rc-monogram.png',
  className = 'h-13 sm:h-16 w-auto',
}: SprocketLogoProps) {
  // Geometry coordinates (viewBox: 0 0 240 56)
  // Large logo drive sprocket (left):
  const largeX = 29;
  const largeY = 28;
  const largeR = 18.5; // Circular logo image radius
  const chainLargeR = 21.2; // Chain radius perfectly hugging the sprocket with zero gap

  // Small sprocket (The 'O' in COMPOUND) - kept exact as user requested:
  const smallX = 132;
  const smallY = 28;
  const smallR = 7; // 'O' ring radius
  const chainSmallR = 9.4;

  // Exact mathematical tangent points for the closed roller chain loop wrapping flush around sprockets
  // large: (29, 28) r=21.2; small: (132, 28) r=9.4
  // deltaX = 103, deltaR = 11.8, sinTheta = 0.1146, cosTheta = 0.9934
  const chainPathD = `M 31.43 6.94 L 133.08 18.66 A 9.4 9.4 0 0 1 133.08 37.34 L 31.43 49.06 A 21.2 21.2 0 1 1 31.43 6.94 Z`;

  // 20 teeth for large sprocket for continuous solid engagement with no gaps
  const largeTeeth = Array.from({ length: 20 });
  // 8 simple white teeth for small sprocket
  const smallTeeth = Array.from({ length: 8 });

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label="Rix Compound Sprocket Logo"
      >
        <defs>
          {/* Circular clip for the user's circle logo image */}
          <clipPath id="sprocketLogoCircleClip">
            <circle cx={largeX} cy={largeY} r={largeR} />
          </clipPath>

          <style>{`
            @keyframes chainFlow {
              from {
                stroke-dashoffset: 0;
              }
              to {
                stroke-dashoffset: -16;
              }
            }
            .sprocket-chain-white {
              animation: chainFlow 0.75s linear infinite;
            }
          `}</style>
        </defs>

        {/* ======================================================== */}
        {/* 1. SLEEK WHITE MOVING ROLLER CHAIN (Wraps around gears)   */}
        {/* ======================================================== */}
        <g id="sprocket-chain">
          {/* Subtle guide track */}
          <path
            d={chainPathD}
            fill="none"
            stroke="#18181b"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Crisp moving chain link plates */}
          <path
            d={chainPathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.0"
            strokeDasharray="5 3"
            strokeLinecap="round"
            className="sprocket-chain-white"
          />

          {/* Clean center roller pin highlights */}
          <path
            d={chainPathD}
            fill="none"
            stroke="#93c5fd"
            strokeWidth="1.1"
            strokeDasharray="1 7"
            strokeLinecap="round"
            className="sprocket-chain-white"
          />
        </g>

        {/* ======================================================== */}
        {/* 2. LARGE SPROCKET (Image + solid rim + zero-gap teeth)    */}
        {/* ======================================================== */}
        <g id="large-sprocket">
          {/* Dark circle under image */}
          <circle cx={largeX} cy={largeY} r={largeR} fill="#18181b" />

          {/* User's circular logo image */}
          <g clipPath="url(#sprocketLogoCircleClip)">
            <image
              href={circleLogoSrc}
              x={largeX - largeR}
              y={largeY - largeR}
              width={largeR * 2}
              height={largeR * 2}
              preserveAspectRatio="xMidYMid meet"
              className={circleLogoSrc === '/rc-monogram.png' ? 'filter invert' : ''}
            />
          </g>

          {/* White border ring around image */}
          <circle
            cx={largeX}
            cy={largeY}
            r={largeR}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
          />

          {/* Rotating sprocket rim and teeth that mesh continuously with the chain */}
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${largeX} ${largeY}`}
              to={`360 ${largeX} ${largeY}`}
              dur="8s"
              repeatCount="indefinite"
            />
            {/* Sprocket outer rim ring that connects to the chain base */}
            <circle
              cx={largeX}
              cy={largeY}
              r="20.2"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* 20 teeth seating flush into the chain line */}
            {largeTeeth.map((_, i) => (
              <polygon
                key={`large-tooth-${i}`}
                points={`${largeX - 1.2},${largeY - 19.5} ${largeX - 0.7},${largeY - 22.4} ${largeX + 0.7},${largeY - 22.4} ${largeX + 1.2},${largeY - 19.5}`}
                fill="#ffffff"
                transform={`rotate(${(i * 360) / 20} ${largeX} ${largeY})`}
              />
            ))}
          </g>
        </g>

        {/* ======================================================== */}
        {/* 3. SMALL SPROCKET (Simple white 'O' in COMPOUND)         */}
        {/* ======================================================== */}
        <g id="small-sprocket-o">
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${smallX} ${smallY}`}
              to={`360 ${smallX} ${smallY}`}
              dur="3.5s"
              repeatCount="indefinite"
            />
            {/* The clean white letter 'O' ring */}
            <circle
              cx={smallX}
              cy={smallY}
              r={smallR}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
            />
            {/* Simple white teeth around the 'O' */}
            {smallTeeth.map((_, i) => (
              <polygon
                key={`small-tooth-${i}`}
                points={`${smallX - 1.0},${smallY - smallR} ${smallX - 0.6},${smallY - smallR - 2.5} ${smallX + 0.6},${smallY - smallR - 2.5} ${smallX + 1.0},${smallY - smallR}`}
                fill="#ffffff"
                transform={`rotate(${(i * 360) / 8} ${smallX} ${smallY})`}
              />
            ))}
          </g>
        </g>

        {/* ======================================================== */}
        {/* 4. TYPOGRAPHY: 'RIX' IN BLUE BETWEEN SPROCKET & COMPOUND */}
        {/* ======================================================== */}
        {/* 'RIX' in BLUE situated horizontally between large sprocket and COMPOUND */}
        <text
          x="62"
          y="34"
          fill="#3b82f6"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="19"
          letterSpacing="0.04em"
        >
          RIX
        </text>

        {/* Letter 'C' in white leading into the small 'O' sprocket */}
        <text
          x="108"
          y="34"
          fill="#ffffff"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="19"
        >
          C
        </text>

        {/* Letters 'MPOUND' in white continuing after the small 'O' sprocket */}
        <text
          x="144"
          y="34"
          fill="#ffffff"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="19"
          letterSpacing="0.03em"
        >
          MPOUND
        </text>
      </svg>
    </div>
  );
}

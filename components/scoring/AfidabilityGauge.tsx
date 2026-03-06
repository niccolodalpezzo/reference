'use client';

import { AfidabilityScore } from '@/lib/types';
import TrendBadge from './TrendBadge';
import clsx from 'clsx';

interface Props {
  score: AfidabilityScore;
  size?: 'sm' | 'md' | 'lg';
}

export default function AfidabilityGauge({ score, size = 'lg' }: Props) {
  const { total, trend, trendReason } = score;
  const pct = total / 1000;

  // SVG circle gauge
  const r = size === 'lg' ? 52 : size === 'md' ? 40 : 28;
  const cx = r + 8;
  const cy = r + 8;
  const strokeWidth = size === 'lg' ? 10 : 7;
  const circumference = 2 * Math.PI * r;
  // Only show 270° arc (from 135° to 405°)
  const arc = circumference * 0.75;
  const filled = arc * pct;
  const empty = arc - filled;

  const color = total >= 700 ? '#C9A84C' : total >= 400 ? '#2200CC' : '#94a3b8';

  const sizeClass = {
    lg: 'text-4xl',
    md: 'text-2xl',
    sm: 'text-xl',
  }[size];

  const svgSize = (r + 8) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#E8E5FF"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc} ${circumference - arc}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={clsx('font-display font-bold leading-none', sizeClass)} style={{ color }}>
            {total}
          </span>
          <span className="text-[10px] text-ndp-muted font-medium mt-0.5">/1000</span>
        </div>
      </div>
      <p className="text-sm font-bold text-ndp-text mt-1">Indice di Affidabilità</p>
      <TrendBadge trend={trend} reason={trendReason} />
    </div>
  );
}

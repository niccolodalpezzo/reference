'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  trend: 'up' | 'down' | 'stable';
  reason: string;
  showReason?: boolean;
}

export default function TrendBadge({ trend, reason, showReason = true }: Props) {
  const config = {
    up: { icon: TrendingUp, color: 'text-green-700 bg-green-50', label: 'In crescita' },
    down: { icon: TrendingDown, color: 'text-red-600 bg-red-50', label: 'In calo' },
    stable: { icon: Minus, color: 'text-ndp-muted bg-ndp-bg', label: 'Stabile' },
  }[trend];

  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={clsx('flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', config.color)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
      {showReason && reason && (
        <p className="text-[10px] text-ndp-muted text-center max-w-[200px] leading-tight">{reason}</p>
      )}
    </div>
  );
}

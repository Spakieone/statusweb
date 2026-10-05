import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { StatusKind } from './status-dot-utils'

// 'tspu' overlays 'online'/'offline'/'pending': the EU vantage point reaches
// the node but RU doesn't (see use-tspu-status.ts), derived client-side.
export type DotStatus = StatusKind | 'tspu'

interface StatusDotProps {
  className?: string
  status: DotStatus
}

// No pulse on the online dot: `animate-pulse` is the loading-skeleton animation
// in this app, and a list of 20+ permanently pulsing rows reads as "still
// loading" rather than "healthy". The halo ring carries the online emphasis.
const TONE_BY_STATUS: Record<DotStatus, string> = {
  online: 'bg-status-healthy ring-3 ring-status-healthy/20',
  offline: 'bg-muted-foreground/60',
  pending: 'bg-status-warning',
  tspu: 'bg-orange-500 ring-3 ring-orange-500/20'
}

export function StatusDot({ status, className }: StatusDotProps) {
  const { t } = useTranslation('common')
  const label = t(`status.${status}`)
  return (
    <>
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={cn('inline-block size-2 rounded-full', TONE_BY_STATUS[status], className)}
        data-slot="status-dot"
        title={label}
      />
    </>
  )
}

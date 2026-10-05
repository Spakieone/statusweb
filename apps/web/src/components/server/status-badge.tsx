import { useTranslation } from 'react-i18next'
import type { StatusKind } from '@/components/server/status-dot-utils'
import { cn } from '@/lib/utils'

// 'tspu' overlays 'online': the node answers from the EU vantage point but
// not the RU one, i.e. it looks DPI-blocked rather than actually down. It is
// derived client-side (see use-tspu-status.ts), never by deriveServerStatus.
export type BadgeStatus = StatusKind | 'tspu'

interface StatusBadgeProps {
  className?: string
  status: BadgeStatus
}

const PILL_TONE: Record<BadgeStatus, string> = {
  online: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  offline: 'bg-red-500/10 text-red-600 dark:text-red-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  tspu: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
}

const DOT_TONE: Record<BadgeStatus, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-red-500',
  pending: 'bg-amber-500',
  tspu: 'bg-orange-500'
}

const LABEL_KEY: Record<BadgeStatus, string> = {
  online: 'common:status.online',
  offline: 'common:status.offline',
  pending: 'servers:card_pending.pending_label',
  tspu: 'common:status.tspu'
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation(['servers', 'common'])
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-xs',
        PILL_TONE[status],
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', DOT_TONE[status])} />
      {t(LABEL_KEY[status], { defaultValue: status })}
    </span>
  )
}

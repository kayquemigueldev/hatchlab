import type { LabConnectionStatus } from './system.types'

interface LabStatusBadgeProps {
    status: LabConnectionStatus
    error: string | null
}

const STATUS_LABELS: Record<
    LabConnectionStatus,
    string
> = {
    CHECKING: 'CHECKING LAB',
    ONLINE: 'LAB ONLINE',
    OFFLINE: 'LAB OFFLINE',
}

export function LabStatusBadge({
                                   status,
                                   error,
                               }: LabStatusBadgeProps) {
    return (
        <div
            className={`lab-status lab-status--${status.toLowerCase()}`}
            title={error ?? undefined}
            role="status"
            aria-live="polite"
        >
      <span
          className="lab-status__indicator"
          aria-hidden="true"
      />

            <span>{STATUS_LABELS[status]}</span>
        </div>
    )
}
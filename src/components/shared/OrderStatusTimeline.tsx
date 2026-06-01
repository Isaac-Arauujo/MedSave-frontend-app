import clsx from 'clsx';
import { getOrderStatusLabel } from '../../constants/orderOptions';
import {
  getOrderStatusBadgeClass,
  getOrderStatusTimelineDotClass,
} from '../../constants/orderStatus';
import type { OrderStatus, OrderStatusHistoryResponse } from '../../types/OrderTypes';
import { formatDateTime } from '../../utils/formatDate';

interface OrderStatusTimelineProps {
  timeline: OrderStatusHistoryResponse[];
  currentStatus: OrderStatus;
}

export const OrderStatusTimeline = ({ timeline, currentStatus }: OrderStatusTimelineProps) => {
  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  );

  if (sortedTimeline.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        Nenhuma atualização de status registrada ainda.
      </p>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-outline-variant pl-6">
      {sortedTimeline.map((entry, index) => {
        const isCurrent = entry.newStatus === currentStatus && index === sortedTimeline.length - 1;

        return (
          <li key={`${entry.changedAt}-${entry.newStatus}-${index}`} className="relative">
            <span
              className={clsx(
                'absolute -left-[1.8125rem] top-1 h-3 w-3 rounded-full ring-4 ring-surface-container-lowest',
                getOrderStatusTimelineDotClass(entry.newStatus),
                isCurrent && 'ring-primary/20'
              )}
              aria-hidden="true"
            />
            <div
              className={clsx(
                'rounded-2xl border p-4',
                isCurrent
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant bg-surface-container-lowest'
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={clsx(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    getOrderStatusBadgeClass(entry.newStatus)
                  )}
                >
                  {getOrderStatusLabel(entry.newStatus)}
                </span>
                {isCurrent && (
                  <span className="text-xs font-semibold uppercase text-primary">Atual</span>
                )}
              </div>
              <p className="text-sm text-on-surface">
                Atualizado por <span className="font-medium">{entry.changedBy}</span>
              </p>
              {entry.reason && (
                <p className="mt-1 text-sm text-on-surface-variant">{entry.reason}</p>
              )}
              <p className="mt-2 text-xs text-on-surface-variant">
                {formatDateTime(entry.changedAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

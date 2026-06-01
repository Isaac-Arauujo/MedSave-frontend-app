import { Link } from 'react-router-dom';
import { getDeliveryOptionLabel } from '../../constants/checkoutOptions';
import { ROUTES } from '../../constants/routes';
import type { OrderSummaryResponse } from '../../types/OrderTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getImageUrl } from '../../utils/getImageUrl';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderSummaryCardProps {
  order: OrderSummaryResponse;
}

export const OrderSummaryCard = ({ order }: OrderSummaryCardProps) => {
  const imageUrl = getImageUrl(order.firstItemImage);
  const detailPath = ROUTES.ORDER_DETAIL.replace(':id', String(order.id));
  const extraItems = order.itemCount - 1;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:items-center">
      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-surface-container sm:h-20 sm:w-20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Imagem do primeiro item do pedido"
            className="h-full w-full object-cover"
            width={80}
            height={80}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              medication
            </span>
          </div>
        )}
        {extraItems > 0 && (
          <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
            +{extraItems} {extraItems === 1 ? 'item' : 'itens'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-headline font-bold text-on-surface">{order.orderNumber}</p>
            <p className="text-sm text-on-surface-variant">{formatDate(order.createdAt)}</p>
            <p className="mt-1 text-sm text-on-surface">{order.pharmacyName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">{getDeliveryOptionLabel(order.deliveryType)}</Badge>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-headline text-lg font-bold text-primary">{formatCurrency(order.total)}</p>
          <Link to={detailPath}>
            <Button variant="secondary" size="sm">
              Ver detalhes
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
};

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import type { OrderResponse } from '../../types/OrderTypes';

interface OrderConfirmationBannerProps {
  order: OrderResponse;
}

export const OrderConfirmationBanner = ({ order }: OrderConfirmationBannerProps) => {
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const isPickup = order.deliveryType === 'PICKUP';
  const isPendingPayment = order.status === 'PENDING_PAYMENT';

  const handleCopyPickupCode = async () => {
    if (!order.pickupCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(order.pickupCode);
      toast.success('Código copiado!');
    } catch {
      toast.error('Não foi possível copiar o código.');
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="material-symbols-outlined rounded-full bg-primary/10 p-2 text-primary"
          aria-hidden="true"
        >
          check_circle
        </span>
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Pedido realizado com sucesso!
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Número do pedido:{' '}
            <span className="font-semibold text-on-surface">{order.orderNumber}</span>
          </p>
        </div>
      </div>

      {isPickup && order.pickupCode && (
        <div className="mb-4 rounded-2xl border border-primary bg-surface-container-lowest p-4">
          <p className="mb-2 text-sm font-medium text-on-surface-variant">Código de retirada</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-headline text-2xl font-bold tracking-widest text-primary">
              {order.pickupCode}
            </p>
            <Button type="button" variant="secondary" size="sm" onClick={() => void handleCopyPickupCode()}>
              Copiar código
            </Button>
          </div>
        </div>
      )}

      {isPendingPayment && (
        <div>
          <Button
            type="button"
            variant="primary"
            onClick={() => setShowPaymentInstructions((current) => !current)}
          >
            Instruções de pagamento
          </Button>

          {showPaymentInstructions && (
            <div className="mt-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
              {order.paymentMethod === 'PIX' ? (
                <p>
                  Complete o pagamento via PIX para confirmar seu pedido. Você receberá as instruções
                  detalhadas por e-mail ou poderá acompanhar o status nesta página.
                </p>
              ) : (
                <p>
                  Complete o pagamento com cartão de crédito para confirmar seu pedido. Você receberá
                  as instruções detalhadas por e-mail ou poderá acompanhar o status nesta página.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

import { differenceInSeconds, parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MercadoPagoCardBrick } from '../../components/payment/MercadoPagoCardBrick';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/PageLoader';
import { Spinner } from '../../components/ui/Spinner';
import { getPaymentMethodLabel } from '../../constants/checkoutOptions';
import {
  getPaymentStatusLabel,
  PAYMENT_POLL_INTERVAL_MS,
  PAYMENT_STATUS_CONFIG,
} from '../../constants/paymentOptions';
import { ROUTES } from '../../constants/routes';
import { usePayment } from '../../hooks/usePayment';
import { useCheckoutStore } from '../../store/checkoutStore';
import type { PaymentMethod } from '../../types/CheckoutTypes';
import type { CardPaymentPayload, MercadoPagoCardFormData } from '../../types/MercadoPagoTypes';
import type { PaymentLocationState } from '../../types/PaymentTypes';
import { formatCurrency } from '../../utils/formatCurrency';

const isTerminalStatus = (status: string | undefined) =>
  status === 'APPROVED' || status === 'REJECTED' || status === 'CANCELLED';

export const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as PaymentLocationState | null;

  const orderId = useMemo(() => {
    if (state?.orderId) {
      return state.orderId;
    }

    const param = searchParams.get('orderId');
    if (!param) {
      return null;
    }

    const parsed = Number(param);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [state?.orderId, searchParams]);

  const paymentMethod: PaymentMethod = state?.paymentMethod ?? 'PIX';
  const order = state?.order;

  const {
    initiation,
    payment,
    isInitiating,
    isPolling,
    error,
    isExpired,
    canPoll,
    setIsExpired,
    setError,
    initiate,
    refreshStatus,
    retry,
  } = usePayment(orderId);

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  const currentStatus = payment?.status ?? initiation?.status;
  const clearCheckoutSession = useCheckoutStore((state) => state.clearSession);

  useEffect(() => {
    clearCheckoutSession();
  }, [clearCheckoutSession]);

  useEffect(() => {
    if (!orderId || paymentMethod !== 'PIX') {
      return;
    }

    void initiate(paymentMethod).catch(() => {
      // Erro tratado no hook (estado error).
    });
  }, [orderId, paymentMethod, initiate]);

  const mapCardFormToPayload = useCallback((formData: MercadoPagoCardFormData): CardPaymentPayload => {
    return {
      token: formData.token,
      paymentMethodId: formData.payment_method_id,
      issuerId: formData.issuer_id,
      installments: formData.installments,
      identificationType: formData.payer?.identification?.type,
      identificationNumber: formData.payer?.identification?.number,
    };
  }, []);

  const handleCardBrickSubmit = useCallback(
    async (formData: MercadoPagoCardFormData) => {
      setRejectionMessage(null);
      const result = await initiate('CREDIT_CARD', mapCardFormToPayload(formData));
      if (result) {
        toast.success('Pagamento enviado. Aguardando confirmação.');
        return;
      }
      throw new Error('Não foi possível processar o pagamento.');
    },
    [initiate, mapCardFormToPayload]
  );

  useEffect(() => {
    if (!initiation?.expiresAt || isExpired) {
      return;
    }

    const updateCountdown = () => {
      const remaining = differenceInSeconds(parseISO(initiation.expiresAt!), new Date());

      if (remaining <= 0) {
        setSecondsRemaining(0);
        setIsExpired(true);
        return;
      }

      setSecondsRemaining(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [initiation?.expiresAt, isExpired, setIsExpired]);

  useEffect(() => {
    if (
      !orderId ||
      !canPoll ||
      isExpired ||
      isTerminalStatus(currentStatus)
    ) {
      return;
    }

    const interval = setInterval(() => {
      void refreshStatus()
        .then((updated) => {
          if (!updated) {
            return;
          }

          if (updated.status === 'APPROVED') {
            toast.success('Pagamento aprovado!');
            navigate(ROUTES.ORDER_DETAIL.replace(':id', String(orderId)), {
              state: {
                paymentApproved: true,
                order,
              },
            });
          }

          if (updated.status === 'REJECTED') {
            setRejectionMessage('Pagamento rejeitado. Tente novamente ou escolha outro método.');
          }
        })
        .catch(() => {
          // Erros tratados em refreshStatus (estado error / pollingStopped).
        });
    }, PAYMENT_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [orderId, canPoll, isExpired, currentStatus, paymentMethod, refreshStatus, navigate, order]);

  const handleCopyPixPayload = async () => {
    const payload = initiation?.pixPayload ?? payment?.pixPayload;

    if (!payload) {
      return;
    }

    try {
      await navigator.clipboard.writeText(payload);
      toast.success('Código PIX copiado!');
    } catch {
      toast.error('Não foi possível copiar o código PIX.');
    }
  };

  const handleRetry = async () => {
    if (paymentMethod === 'CREDIT_CARD') {
      setRejectionMessage(null);
      setError(null);
      window.location.reload();
      return;
    }

    setRejectionMessage(null);
    setIsExpired(false);
    setSecondsRemaining(null);

    try {
      await retry(paymentMethod);
      toast.success('Novo pagamento iniciado.');
    } catch {
      // error handled in hook
    }
  };

  if (!orderId) {
    return (
      <PageWrapper title="Pagamento">
        <EmptyState
          title="Pedido não informado"
          description="Inicie o pagamento a partir do checkout ou de um pedido pendente."
          action={
            <Link to={ROUTES.CHECKOUT}>
              <Button variant="primary">Ir para o checkout</Button>
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  if (paymentMethod === 'PIX' && isInitiating && !initiation) {
    return <PageLoader message="Iniciando pagamento..." />;
  }

  if (paymentMethod === 'CREDIT_CARD' && isInitiating) {
    return <PageLoader message="Processando pagamento com cartão..." />;
  }

  const orderTotal = order?.total ?? 0;

  if (error && !initiation) {
    return <ErrorState message={error} onRetry={() => void handleRetry()} />;
  }

  const pixPayload = initiation?.pixPayload ?? payment?.pixPayload ?? '';
  const paymentUrl = initiation?.paymentUrl ?? payment?.paymentUrl;
  const statusConfig = currentStatus ? PAYMENT_STATUS_CONFIG[currentStatus] : null;
  const showRetry = isExpired || currentStatus === 'REJECTED' || Boolean(rejectionMessage);

  return (
    <PageWrapper
      title="Pagamento"
      description={
        order?.orderNumber
          ? `Pedido ${order.orderNumber} · ${getPaymentMethodLabel(paymentMethod)}`
          : getPaymentMethodLabel(paymentMethod)
      }
    >
      <section className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface">
              {getPaymentMethodLabel(paymentMethod)}
            </h2>
            {order && (
              <p className="text-sm text-on-surface-variant">
                Total: {formatCurrency(order.total)}
              </p>
            )}
          </div>
          {statusConfig && (
            <Badge variant={statusConfig.variant}>{getPaymentStatusLabel(currentStatus!)}</Badge>
          )}
        </div>

        {isPolling && (
          <p className="mb-4 flex items-center gap-2 text-sm text-on-surface-variant">
            <Spinner size="sm" />
            Verificando status do pagamento...
          </p>
        )}

        {rejectionMessage && (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
            {rejectionMessage}
          </p>
        )}

        {isExpired && (
          <div className="mb-4 rounded-2xl border border-[var(--color-warning)] bg-amber-50 p-4">
            <p className="font-medium text-on-surface">Pagamento expirado</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              O prazo para pagamento encerrou. Gere um novo pagamento para continuar.
            </p>
          </div>
        )}

        {!isExpired &&
          paymentMethod === 'PIX' &&
          !initiation?.pixQrCodeBase64 &&
          !pixPayload &&
          !isInitiating &&
          initiation && (
            <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-on-surface" role="alert">
              O PIX foi iniciado, mas o QR Code não foi retornado. Verifique a configuração do Mercado
              Pago no servidor ou tente novamente.
            </p>
          )}

        {!isExpired && paymentMethod === 'PIX' && initiation?.pixQrCodeBase64 && (
          <div className="mb-6 flex flex-col items-center gap-4">
            <img
              src={`data:image/png;base64,${initiation.pixQrCodeBase64}`}
              alt="QR Code PIX para pagamento"
              width={240}
              height={240}
              className="rounded-2xl border border-outline-variant bg-white p-3"
            />

            {secondsRemaining !== null && secondsRemaining > 0 && (
              <p className="text-sm text-on-surface-variant" role="timer">
                Expira em {Math.floor(secondsRemaining / 60)}:
                {String(secondsRemaining % 60).padStart(2, '0')}
              </p>
            )}
          </div>
        )}

        {!isExpired && paymentMethod === 'PIX' && pixPayload && (
          <div className="mb-6">
            <Input label="PIX Copia e Cola" value={pixPayload} readOnly className="font-mono text-xs" />
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={() => void handleCopyPixPayload()}
            >
              Copiar código
            </Button>
          </div>
        )}

        {!isExpired && paymentMethod === 'CREDIT_CARD' && paymentUrl && (
          <div className="mb-6">
            <iframe
              src={paymentUrl}
              title="Pagamento com cartão de crédito"
              className="h-96 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest"
            />
            <p className="mt-3 text-sm text-on-surface-variant">
              Complete o pagamento na janela acima. O status será atualizado automaticamente.
            </p>
          </div>
        )}

        {!isExpired &&
          paymentMethod === 'CREDIT_CARD' &&
          !initiation &&
          !isTerminalStatus(currentStatus) &&
          orderTotal > 0 && (
            <div className="mb-6">
              <MercadoPagoCardBrick
                amount={orderTotal}
                onSubmit={handleCardBrickSubmit}
                onError={(message) => {
                  setError(message);
                }}
              />
            </div>
          )}

        {!isExpired &&
          paymentMethod === 'CREDIT_CARD' &&
          !initiation &&
          orderTotal <= 0 && (
            <p className="mb-4 text-sm text-on-surface-variant">
              Valor do pedido indisponível. Volte ao checkout e tente novamente.
            </p>
          )}

        {showRetry && (
          <Button type="button" variant="primary" onClick={() => void handleRetry()} isLoading={isInitiating}>
            Tentar novamente
          </Button>
        )}
      </section>
    </PageWrapper>
  );
};

import { loadMercadoPago } from '@mercadopago/sdk-js';
import { useEffect, useId, useRef } from 'react';
import { getPaymentPublicConfig } from '../../api/paymentApi';
import type { MercadoPagoCardFormData } from '../../types/MercadoPagoTypes';
interface MercadoPagoCardBrickProps {
  amount: number;
  onSubmit: (data: MercadoPagoCardFormData) => Promise<void>;
  onError?: (message: string) => void;
}

export const MercadoPagoCardBrick = ({ amount, onSubmit, onError }: MercadoPagoCardBrickProps) => {
  const reactId = useId().replace(/:/g, '');
  const containerId = `mp-card-brick-${reactId}`;
  const brickControllerRef = useRef<{ unmount?: () => void } | null>(null);
  const onSubmitRef = useRef(onSubmit);
  const onErrorRef = useRef(onError);

  onSubmitRef.current = onSubmit;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const config = await getPaymentPublicConfig();
        const envKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY as string | undefined;
        const publicKey = envKey?.trim() || config.publicKey?.trim();

        if (!publicKey) {
          onErrorRef.current?.('Chave pública do Mercado Pago não configurada.');
          return;
        }

        if (config.useMock) {
          onErrorRef.current?.(
            'Modo mock ativo no servidor. Defina MERCADOPAGO_USE_MOCK=false para cartão real.'
          );
          return;
        }

        const mp = await loadMercadoPago(publicKey, { locale: 'pt-BR' });
        if (cancelled) {
          return;
        }

        const bricksBuilder = mp.bricks();
        const controller = await bricksBuilder.create('cardPayment', containerId, {
          initialization: {
            amount,
          },
          callbacks: {
            onSubmit: (cardFormData) =>
              new Promise<void>((resolve, reject) => {
                void onSubmitRef
                  .current(cardFormData as MercadoPagoCardFormData)
                  .then(() => resolve())
                  .catch((err: unknown) => reject(err));
              }),
            onError: (error) => {
              const message =
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message: unknown }).message === 'string'
                  ? (error as { message: string }).message
                  : 'Erro no formulário de cartão.';
              onErrorRef.current?.(message);
            },
          },
        });

        brickControllerRef.current = controller;
      } catch {
        onErrorRef.current?.('Não foi possível carregar o formulário de cartão do Mercado Pago.');
      }
    };

    void init();

    return () => {
      cancelled = true;
      brickControllerRef.current?.unmount?.();
      brickControllerRef.current = null;
    };
  }, [amount, containerId]);

  return <div id={containerId} className="min-h-[320px]" />;
};

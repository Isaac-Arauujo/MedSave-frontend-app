import { loadMercadoPago } from '@mercadopago/sdk-js';
import { useEffect, useId, useRef } from 'react';
import { getPaymentPublicConfig } from '../../api/paymentApi';
import type { MercadoPagoCardFormData } from '../../types/MercadoPagoTypes';

interface MercadoPagoCardBrickProps {
  amount: number;
  onSubmit: (data: MercadoPagoCardFormData) => Promise<void>;
  onError?: (message: string) => void;
}

type MercadoPagoInstance = {
  bricks: () => {
    create: (
      brickType: string,
      containerId: string,
      settings: Record<string, unknown>
    ) => Promise<{ unmount?: () => void }>;
  };
};

type MercadoPagoConstructor = new (
  publicKey: string,
  options?: { locale?: string }
) => MercadoPagoInstance;

const normalizeAmount = (value: number): number | null => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Math.round(amount * 100) / 100;
};

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
      const normalizedAmount = normalizeAmount(amount);
      if (normalizedAmount === null) {
        onErrorRef.current?.('Valor do pedido inválido para pagamento com cartão.');
        return;
      }

      let publicKey: string | undefined;

      try {
        const config = await getPaymentPublicConfig();
        const envKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY as string | undefined;
        publicKey = envKey?.trim() || config.publicKey?.trim();

        console.info('[MP] card form init', {
          publicKeyPresent: Boolean(publicKey),
          publicKeyPrefix: publicKey?.slice(0, 7),
          amount: normalizedAmount,
          paymentMethod: 'CREDIT_CARD',
        });

        if (!publicKey) {
          onErrorRef.current?.('Configuração de pagamento indisponível. Tente novamente mais tarde.');
          console.error('[MP] public key missing', {
            publicKeyPresent: false,
            amount: normalizedAmount,
          });
          return;
        }

        if (config.useMock) {
          onErrorRef.current?.(
            'Modo mock ativo no servidor. Defina MERCADOPAGO_USE_MOCK=false para cartão real.'
          );
          return;
        }

        if (!document.getElementById(containerId)) {
          throw new Error('Container do formulário de cartão não encontrado.');
        }

        const MercadoPagoSdk = (await loadMercadoPago()) as MercadoPagoConstructor | null;
        if (!MercadoPagoSdk) {
          throw new Error('SDK Mercado Pago indisponível.');
        }

        if (cancelled) {
          return;
        }

        const mp = new MercadoPagoSdk(publicKey, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();
        const controller = await bricksBuilder.create('cardPayment', containerId, {
          initialization: {
            amount: normalizedAmount,
          },
          callbacks: {
            onReady: () => {
              console.info('[MP] card form ready', { amount: normalizedAmount });
            },
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
              console.error('[MP] brick error', { message });
              onErrorRef.current?.(message);
            },
          },
        });

        brickControllerRef.current = controller;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível carregar o formulário de cartão do Mercado Pago.';
        console.error('[MP] card form init failed', {
          message,
          publicKeyPresent: Boolean(publicKey),
          publicKeyPrefix: publicKey?.slice(0, 7),
          amount: normalizeAmount(amount),
        });
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

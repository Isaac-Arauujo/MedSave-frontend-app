import { useEffect } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useListingFreight } from '../../hooks/useListingFreight';
import { formatCurrency } from '../../utils/formatCurrency';
import type { DeliveryType } from '../../types/CheckoutTypes';

interface ListingFreightCalculatorProps {
  listingId: number;
  deliveryAvailable?: boolean;
  className?: string;
}

export const ListingFreightCalculator = ({
  listingId,
  deliveryAvailable = true,
  className,
}: ListingFreightCalculatorProps) => {
  const {
    form,
    updateZipCode,
    setForm,
    cepPreview,
    cepLoading,
    addresses,
    addressesLoading,
    loadAddresses,
    selectAddress,
    options,
    isCalculating,
    error,
    calculateAll,
    deliveryTypeLabel,
    isCustomer,
  } = useListingFreight(listingId);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  return (
    <section
      className={clsx(
        'rounded-2xl border border-outline-variant bg-surface-container-lowest p-4',
        className
      )}
      aria-labelledby="freight-calculator-title"
    >
      <h3
        id="freight-calculator-title"
        className="font-headline text-lg font-semibold text-on-surface"
      >
        Calcular frete
      </h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Informe seu CEP para calcular o frete.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input
          label="CEP"
          value={form.zipCode}
          onChange={(event) => updateZipCode(event.target.value)}
          placeholder="00000-000"
          inputMode="numeric"
          autoComplete="postal-code"
        />
        <Input
          label="Número"
          value={form.number}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              number: event.target.value,
              selectedAddressId: null,
            }))
          }
          placeholder="Ex.: 500"
        />
        <div className="sm:col-span-2">
          <Input
            label="Complemento (opcional)"
            value={form.complement}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, complement: event.target.value }))
            }
            placeholder="Apto, bloco..."
          />
        </div>
      </div>

      {cepLoading && (
        <p className="mt-2 text-sm text-on-surface-variant">Buscando endereço pelo CEP...</p>
      )}
      {cepPreview && !cepLoading && (
        <p className="mt-2 text-sm text-on-surface">{cepPreview}</p>
      )}

      {isCustomer && (
        <div className="mt-4">
          <p className="text-sm font-medium text-on-surface">Ou selecione um endereço salvo</p>
          {addressesLoading ? (
            <p className="mt-2 text-sm text-on-surface-variant">Carregando endereços...</p>
          ) : addresses.length === 0 ? (
            <p className="mt-2 text-sm text-on-surface-variant">
              Nenhum endereço salvo. Use CEP e número acima.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {addresses.map((address) => (
                <li key={address.id}>
                  <button
                    type="button"
                    className={clsx(
                      'w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                      form.selectedAddressId === address.id
                        ? 'border-primary bg-primary/5 text-on-surface'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                    )}
                    onClick={() => selectAddress(address)}
                  >
                    {address.street}, {address.number} — {address.neighborhood}, {address.city}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!deliveryAvailable && (
        <p className="mt-3 text-sm text-[var(--color-warning)]" role="alert">
          Entrega indisponível para esta farmácia no momento. Retirada na loja pode estar
          disponível.
        </p>
      )}

      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full sm:w-auto"
        onClick={() => void calculateAll()}
        isLoading={isCalculating}
      >
        Calcular frete
      </Button>

      {isCalculating && (
        <p className="mt-3 text-sm text-on-surface-variant">Calculando frete...</p>
      )}

      {error && (
        <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {options.length > 0 && (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {options.map((option) => (
            <li
              key={option.deliveryType}
              className="flex items-center justify-between rounded-xl bg-surface-container px-3 py-2 text-sm"
            >
              <span className="font-medium text-on-surface">
                {deliveryTypeLabel[option.deliveryType as DeliveryType]}
              </span>
              <span className="font-semibold text-primary">
                {option.deliveryType === 'PICKUP'
                  ? 'Grátis'
                  : formatCurrency(option.freight.price)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

import { useEffect } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import { useListingFreight } from '../../hooks/useListingFreight';
import { formatCurrency } from '../../utils/formatCurrency';
import type { ListingPharmacySummary } from '../../types/ListingTypes';

interface ListingFreightCalculatorProps {
  listingId: number;
  pharmacy?: ListingPharmacySummary;
  deliveryAvailable?: boolean;
  className?: string;
}

export const ListingFreightCalculator = ({
  listingId,
  pharmacy,
  deliveryAvailable = true,
  className,
}: ListingFreightCalculatorProps) => {
  const {
    form,
    updateZipCode,
    setForm,
    showNumberField,
    setShowNumberField,
    showSavedAddresses,
    setShowSavedAddresses,
    cepValid,
    cepPreview,
    cepLoading,
    addresses,
    addressesLoading,
    loadAddresses,
    selectAddress,
    pickupOption,
    deliveryOptions,
    hasDeliveryFailure,
    approximate,
    isCalculating,
    formError,
    deliveryError,
    calculateAll,
    deliveryTypeLabel,
    pharmacyPickupLine,
    pharmacyName,
    isCustomer,
  } = useListingFreight(listingId, pharmacy);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const hasResults = pickupOption != null || deliveryOptions.length > 0 || hasDeliveryFailure;

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
        className="font-headline text-base font-semibold text-on-surface"
      >
        Consultar formas de entrega
      </h3>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="sr-only">CEP</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            value={form.zipCode}
            onChange={(event) => updateZipCode(event.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={() => void calculateAll()}
          isLoading={isCalculating}
          disabled={!form.zipCode.trim()}
        >
          Calcular
        </Button>
      </div>

      {cepLoading && (
        <p className="mt-2 text-xs text-on-surface-variant">Validando CEP...</p>
      )}

      {cepValid && cepPreview && !cepLoading && (
        <div className="mt-2 text-xs text-on-surface-variant">
          <p className="font-medium text-on-surface">CEP válido</p>
          <p>Rua/Região identificada: {cepPreview}</p>
        </div>
      )}

      {isCustomer && addresses.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => setShowSavedAddresses((open) => !open)}
          >
            {showSavedAddresses ? 'Ocultar endereços salvos' : 'Usar endereço salvo'}
          </button>
          {showSavedAddresses && (
            <div className="mt-1">
              {addressesLoading ? (
                <p className="text-xs text-on-surface-variant">Carregando...</p>
              ) : (
                <select
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1.5 text-xs text-on-surface"
                  value={form.selectedAddressId ?? ''}
                  onChange={(event) => {
                    const id = Number(event.target.value);
                    const address = addresses.find((item) => item.id === id);
                    if (address) {
                      selectAddress(address);
                    }
                  }}
                >
                  <option value="">Selecione um endereço</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.street}, {address.number} — {address.neighborhood}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      {!showNumberField && (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-primary hover:underline"
          onClick={() => setShowNumberField(true)}
        >
          Adicionar número para melhorar a precisão
        </button>
      )}

      {showNumberField && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Número"
            value={form.number}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                number: event.target.value,
                selectedAddressId: null,
              }))
            }
            className="w-24 rounded-xl border border-outline-variant px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            placeholder="Complemento (opcional)"
            value={form.complement}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, complement: event.target.value }))
            }
            className="min-w-0 flex-1 rounded-xl border border-outline-variant px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {formError && (
        <p className="mt-2 text-xs text-[var(--color-danger)]" role="alert">
          {formError}
        </p>
      )}

      {!deliveryAvailable && !hasResults && (
        <p className="mt-2 text-xs text-[var(--color-warning)]">
          Entrega indisponível para esta farmácia no momento.
        </p>
      )}

      {isCalculating && (
        <p className="mt-3 text-xs text-on-surface-variant">Calculando opções...</p>
      )}

      {hasResults && !isCalculating && (
        <div className="mt-4 space-y-4" aria-live="polite">
          {(deliveryOptions.length > 0 || hasDeliveryFailure) && deliveryAvailable && (
            <div>
              <p className="text-sm font-semibold text-on-surface">Receber em casa</p>
              {approximate && deliveryOptions.length > 0 && (
                <p className="text-xs text-on-surface-variant">Estimativa aproximada pelo CEP</p>
              )}
              {deliveryOptions.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {deliveryOptions.map((option) => (
                    <li
                      key={option.deliveryType}
                      className="flex items-center justify-between text-sm text-on-surface"
                    >
                      <span>{deliveryTypeLabel[option.deliveryType]}</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(option.price ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                deliveryError && (
                  <p className="mt-1 text-sm text-on-surface-variant">{deliveryError}</p>
                )
              )}
            </div>
          )}

          {pickupOption && (
            <div>
              <p className="text-sm font-semibold text-on-surface">Retirar na farmácia</p>
              {pharmacyName && (
                <p className="text-xs text-on-surface-variant">{pharmacyName}</p>
              )}
              {pharmacyPickupLine && (
                <p className="text-xs text-on-surface-variant">{pharmacyPickupLine}</p>
              )}
              <p className="mt-1 text-sm font-semibold text-primary">Grátis</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

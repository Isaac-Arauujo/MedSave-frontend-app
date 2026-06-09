import { useState } from 'react';
import clsx from 'clsx';
import { useProductDeliveryFreight } from '../../hooks/useProductDeliveryFreight';
import type { CreateAddressRequest } from '../../types/AddressTypes';
import type { ListingPharmacySummary } from '../../types/ListingTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { deliveryTypeLabel } from '../../utils/productDeliveryFreight';
import { AddressFormModal } from './AddressFormModal';
import { ProductFreightAddressAutocomplete } from './ProductFreightAddressAutocomplete';

interface ProductDeliveryCardProps {
  listingId: number;
  pharmacy?: ListingPharmacySummary;
  deliveryAvailable?: boolean;
  className?: string;
}

export const ProductDeliveryCard = ({
  listingId,
  pharmacy,
  deliveryAvailable = true,
  className,
}: ProductDeliveryCardProps) => {
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const {
    isCustomer,
    selectedAddressLine,
    selectAddress,
    deliverableAddresses,
    handleGuestPlaceSelected,
    handleGuestInputChange,
    guestHint,
    loggedInWithoutAddress,
    loggedInWithoutCoords,
    pickupOption,
    deliveryOptions,
    hasDeliveryFailure,
    deliveryError,
    isCalculating,
    hasCalculated,
    handleAddressCreated,
    pharmacyPickupLine,
    pharmacyName,
  } = useProductDeliveryFreight(listingId, pharmacy, deliveryAvailable);

  const handleCreateAddress = async (
    data: CreateAddressRequest,
    setAsDefault: boolean
  ) => {
    try {
      setIsSavingAddress(true);
      await handleAddressCreated(data, setAsDefault);
      setShowAddressModal(false);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const showDeliverySection = deliveryAvailable && (isCustomer || hasCalculated || isCalculating);
  const showGuestInput = !isCustomer;

  return (
    <>
      <section
        className={clsx(
          'rounded-2xl border border-outline-variant bg-surface-container-lowest p-4',
          className
        )}
        aria-labelledby="product-delivery-title"
      >
        <h3
          id="product-delivery-title"
          className="font-headline text-sm font-semibold text-on-surface"
        >
          Entrega e retirada
        </h3>

        {isCustomer && selectedAddressLine && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-on-surface-variant">Entregar em:</p>
            <p className="text-sm text-on-surface">{selectedAddressLine}</p>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setShowAddressPicker((open) => !open)}
            >
              Selecionar outro endereço
            </button>
            {showAddressPicker && (
              <ul className="space-y-1 rounded-xl border border-outline-variant p-2">
                {deliverableAddresses.map((address) => (
                  <li key={address.id}>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-2 text-left text-xs text-on-surface hover:bg-surface-container"
                      onClick={() => {
                        selectAddress(address);
                        setShowAddressPicker(false);
                      }}
                    >
                      {address.street}, {address.number} - {address.city}/{address.state}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="w-full rounded-lg px-2 py-2 text-left text-xs font-medium text-primary hover:bg-surface-container"
                    onClick={() => {
                      setShowAddressPicker(false);
                      setShowAddressModal(true);
                    }}
                  >
                    + Adicionar novo endereço
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}

        {loggedInWithoutAddress && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-on-surface-variant">
              Cadastre um endereço com número para calcular o frete.
            </p>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setShowAddressModal(true)}
            >
              Adicionar endereço
            </button>
          </div>
        )}

        {loggedInWithoutCoords && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-on-surface-variant">
              Selecione ou cadastre um endereço para calcular.
            </p>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setShowAddressModal(true)}
            >
              Adicionar endereço
            </button>
          </div>
        )}

        {showGuestInput && (
          <div className="mt-3 space-y-2">
            <ProductFreightAddressAutocomplete
              onPlaceSelected={handleGuestPlaceSelected}
              onUserInputChange={handleGuestInputChange}
            />
            {guestHint && (
              <p className="text-xs text-on-surface-variant" role="status">
                {guestHint}
              </p>
            )}
          </div>
        )}

        {isCalculating && (
          <p className="mt-3 text-xs text-on-surface-variant">Calculando entrega...</p>
        )}

        {!isCalculating && showDeliverySection && (
          <div className="mt-3 space-y-3" aria-live="polite">
            {(deliveryOptions.length > 0 || hasDeliveryFailure) && (
              <div>
                <p className="text-xs font-semibold text-on-surface">Receber em casa</p>
                {deliveryOptions.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {deliveryOptions.map((option) => (
                      <li
                        key={option.deliveryType}
                        className="flex items-center justify-between gap-3 text-xs text-on-surface"
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
                    <p className="mt-1 text-xs text-on-surface-variant">{deliveryError}</p>
                  )
                )}
              </div>
            )}

            {!deliveryAvailable && hasCalculated && (
              <p className="text-xs text-on-surface-variant">
                Entrega indisponível para este endereço.
              </p>
            )}
          </div>
        )}

        <div className="mt-3 border-t border-outline-variant pt-3">
          <p className="text-xs font-semibold text-on-surface">Retirar na farmácia</p>
          {pharmacyName && (
            <p className="text-xs text-on-surface-variant">{pharmacyName}</p>
          )}
          {pharmacyPickupLine && (
            <p className="text-xs text-on-surface-variant">{pharmacyPickupLine}</p>
          )}
          <p className="mt-1 text-xs font-semibold text-primary">Grátis</p>
        </div>
      </section>

      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleCreateAddress}
        isSubmitting={isSavingAddress}
      />
    </>
  );
};

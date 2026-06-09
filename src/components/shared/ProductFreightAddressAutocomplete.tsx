import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  extractGooglePlaceAddress,
  isCepOnlySearchInput,
  type ExtractedGooglePlaceAddress,
} from '../../utils/extractGooglePlaceAddress';
import { resolveGooglePlaceResult } from '../../utils/googlePlaceDetails';
import { loadGoogleMapsApi } from '../../utils/googleMapsLoader';
import { logGooglePlaces } from '../../utils/googlePlacesLogger';

interface ProductFreightAddressAutocompleteProps {
  onPlaceSelected: (place: ExtractedGooglePlaceAddress) => void;
  onUserInputChange?: (value: string) => void;
  disabled?: boolean;
}

const AUTocomplete_FIELDS = [
  'place_id',
  'formatted_address',
  'address_components',
  'geometry',
] as const;

export const ProductFreightAddressAutocomplete = ({
  onPlaceSelected,
  onUserInputChange,
  disabled = false,
}: ProductFreightAddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isSelectingPlaceRef = useRef(false);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const onUserInputChangeRef = useRef(onUserInputChange);
  const lastSelectedInputValueRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputHint, setInputHint] = useState<string | null>(null);

  onPlaceSelectedRef.current = onPlaceSelected;
  onUserInputChangeRef.current = onUserInputChange;

  const finishProgrammaticSelection = (selectedInputValue?: string) => {
    if (selectedInputValue) {
      lastSelectedInputValueRef.current = selectedInputValue;
    }
    window.setTimeout(() => {
      isSelectingPlaceRef.current = false;
    }, 300);
  };

  useEffect(() => {
    const markPacSelectionStart = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.pac-container')) {
        isSelectingPlaceRef.current = true;
        logGooglePlaces('pac suggestion interaction started');
      }
    };

    document.addEventListener('mousedown', markPacSelectionStart, true);
    document.addEventListener('touchstart', markPacSelectionStart, true);

    return () => {
      document.removeEventListener('mousedown', markPacSelectionStart, true);
      document.removeEventListener('touchstart', markPacSelectionStart, true);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const setupAutocomplete = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        await loadGoogleMapsApi();

        if (!active || !inputRef.current) {
          return;
        }

        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'br' },
          fields: [...AUTocomplete_FIELDS],
          types: ['address'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          void (async () => {
            isSelectingPlaceRef.current = true;
            logGooglePlaces('place_changed fired');

            try {
              const initialPlace = autocompleteRef.current?.getPlace();
              const resolvedPlace = await resolveGooglePlaceResult(initialPlace);
              if (!resolvedPlace) {
                setInputHint('Não foi possível localizar esse endereço. Tente outra sugestão.');
                finishProgrammaticSelection();
                return;
              }

              const extracted = extractGooglePlaceAddress(resolvedPlace);
              if (!extracted || !extracted.numberFromGoogle) {
                setInputHint('Selecione uma sugestão com número ou busque incluindo o número.');
                finishProgrammaticSelection();
                return;
              }

              setInputHint(null);
              onPlaceSelectedRef.current(extracted);
              finishProgrammaticSelection(
                resolvedPlace.formatted_address ?? inputRef.current?.value ?? undefined
              );
            } catch {
              setInputHint('Não foi possível localizar esse endereço. Tente outra sugestão.');
              finishProgrammaticSelection();
            }
          })();
        });
      } catch {
        if (active) {
          setLoadError('Não foi possível carregar a busca de endereços.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void setupAutocomplete();

    return () => {
      active = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="product-freight-address" className="text-xs text-on-surface-variant">
        Digite seu endereço com número
      </label>
      <input
        ref={inputRef}
        id="product-freight-address"
        type="text"
        placeholder="Ex: Rua Exemplo, 123, São Paulo"
        disabled={disabled || isLoading || Boolean(loadError)}
        autoComplete="off"
        onChange={(event) => {
          const value = event.target.value;

          if (isSelectingPlaceRef.current) {
            return;
          }

          if (
            lastSelectedInputValueRef.current
            && value.trim() === lastSelectedInputValueRef.current.trim()
          ) {
            return;
          }

          if (isCepOnlySearchInput(value)) {
            setInputHint('Use rua, número e cidade para calcular o frete.');
          } else {
            setInputHint(null);
          }

          onUserInputChangeRef.current?.(value);
        }}
        className={clsx(
          'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface',
          'placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          'min-h-11 touch-manipulation'
        )}
      />
      {loadError && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {loadError}
        </p>
      )}
      {inputHint && (
        <p className="text-xs text-[var(--color-warning)]" role="status">
          {inputHint}
        </p>
      )}
    </div>
  );
};

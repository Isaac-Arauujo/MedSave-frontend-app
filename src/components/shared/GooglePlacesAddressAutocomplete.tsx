import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  extractGooglePlaceAddress,
  type ExtractedGooglePlaceAddress,
} from '../../utils/extractGooglePlaceAddress';
import { resolveGooglePlaceResult } from '../../utils/googlePlaceDetails';
import { loadGoogleMapsApi } from '../../utils/googleMapsLoader';
import { logGooglePlaces } from '../../utils/googlePlacesLogger';
import { Input } from '../ui/Input';

interface GooglePlacesAddressAutocompleteProps {
  onPlaceSelected: (place: ExtractedGooglePlaceAddress) => void;
  onUserInputChange?: (value: string) => void;
  disabled?: boolean;
  resetKey?: string | number;
}

const AUTocomplete_FIELDS = [
  'place_id',
  'formatted_address',
  'address_components',
  'geometry',
] as const;

export const GooglePlacesAddressAutocomplete = ({
  onPlaceSelected,
  onUserInputChange,
  disabled = false,
  resetKey,
}: GooglePlacesAddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isSelectingPlaceRef = useRef(false);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const onUserInputChangeRef = useRef(onUserInputChange);
  const lastSelectedInputValueRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionError, setSelectionError] = useState<string | null>(null);

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
    setSelectionError(null);
    lastSelectedInputValueRef.current = null;
  }, [resetKey]);

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
              const hasPlaceId = Boolean(initialPlace?.place_id);
              const hasGeometry = Boolean(initialPlace?.geometry?.location);
              const componentsCount = initialPlace?.address_components?.length ?? 0;

              logGooglePlaces(
                `place received hasPlaceId=${hasPlaceId} hasGeometry=${hasGeometry} componentsCount=${componentsCount}`
              );

              const resolvedPlace = await resolveGooglePlaceResult(initialPlace);
              if (!resolvedPlace) {
                setSelectionError('Não foi possível obter a localização. Tente outra sugestão.');
                finishProgrammaticSelection();
                return;
              }

              const extracted = extractGooglePlaceAddress(resolvedPlace);
              logGooglePlaces(
                `extracted address hasStreet=${Boolean(extracted?.street)} hasNumber=${Boolean(extracted?.number)} hasCity=${Boolean(extracted?.city)} hasState=${Boolean(extracted?.state)} hasZip=${Boolean(extracted?.zipCode && extracted.zipCode.length === 8)}`
              );

              if (!extracted) {
                setSelectionError('Não foi possível obter a localização. Tente outra sugestão.');
                finishProgrammaticSelection();
                return;
              }

              setSelectionError(null);
              onPlaceSelectedRef.current(extracted);
              logGooglePlaces('form populated from place');
              logGooglePlaces('selectedPlace valid=true');
              finishProgrammaticSelection(
                resolvedPlace.formatted_address ?? inputRef.current?.value ?? undefined
              );
            } catch {
              setSelectionError('Não foi possível obter a localização. Tente outra sugestão.');
              finishProgrammaticSelection();
            }
          })();
        });
      } catch {
        if (active) {
          setLoadError('Não foi possível carregar a busca de endereços. Tente novamente mais tarde.');
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
  }, [resetKey]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={inputRef}
        label="Busque seu endereço com número"
        placeholder="Ex: Rua Exemplo, 123, São Paulo"
        required
        disabled={disabled || isLoading || Boolean(loadError)}
        onChange={(event) => {
          const value = event.target.value;

          if (isSelectingPlaceRef.current) {
            logGooglePlaces('input change ignored because selection in progress');
            return;
          }

          if (
            lastSelectedInputValueRef.current &&
            value.trim() === lastSelectedInputValueRef.current.trim()
          ) {
            logGooglePlaces('input change ignored because value matches selected place');
            return;
          }

          logGooglePlaces(`input changed source=user length=${value.length}`);
          setSelectionError(null);
          onUserInputChangeRef.current?.(value);
        }}
        autoComplete="off"
        className={clsx(
          'min-h-12 text-base sm:min-h-0 sm:text-sm',
          'touch-manipulation'
        )}
      />

      {isLoading && (
        <p className="text-xs text-on-surface-variant">Carregando busca de endereços...</p>
      )}
      {loadError && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {loadError}
        </p>
      )}
      {selectionError && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {selectionError}
        </p>
      )}
    </div>
  );
};

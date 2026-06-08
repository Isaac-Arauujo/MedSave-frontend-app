import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  extractGooglePlaceAddress,
  type ExtractedGooglePlaceAddress,
} from '../../utils/extractGooglePlaceAddress';
import { loadGoogleMapsApi } from '../../utils/googleMapsLoader';
import { Input } from '../ui/Input';

interface GooglePlacesAddressAutocompleteProps {
  onPlaceSelected: (place: ExtractedGooglePlaceAddress) => void;
  onInputChange?: (value: string) => void;
  disabled?: boolean;
  resetKey?: string | number;
}

export const GooglePlacesAddressAutocomplete = ({
  onPlaceSelected,
  onInputChange,
  disabled = false,
  resetKey,
}: GooglePlacesAddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
    setSelectionError(null);
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
          fields: ['place_id', 'formatted_address', 'address_components', 'geometry'],
          types: ['address'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place) {
            setSelectionError('Não foi possível obter a localização. Tente outra sugestão.');
            return;
          }

          const extracted = extractGooglePlaceAddress(place);
          if (!extracted) {
            setSelectionError('Não foi possível obter a localização. Tente outra sugestão.');
            return;
          }

          setSelectionError(null);
          onPlaceSelected(extracted);
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
  }, [onPlaceSelected, resetKey]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={inputRef}
        label="Busque seu endereço com número"
        placeholder="Ex: Rua Exemplo, 123, São Paulo"
        required
        disabled={disabled || isLoading || Boolean(loadError)}
        onChange={(event) => {
          setSelectionError(null);
          onInputChange?.(event.target.value);
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

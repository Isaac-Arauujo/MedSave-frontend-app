import { useEffect, useRef, useState } from 'react';
import { extractGooglePlaceAddress, type ExtractedGooglePlaceAddress } from '../../utils/extractGooglePlaceAddress';
import { loadGoogleMapsApi } from '../../utils/googleMapsLoader';
import { Input } from '../ui/Input';

interface GooglePlacesAddressAutocompleteProps {
  onPlaceSelected: (place: ExtractedGooglePlaceAddress) => void;
  onInputChange?: () => void;
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
            setSelectionError('Não foi possível obter a localização desse endereço. Tente selecionar outra sugestão.');
            return;
          }

          const extracted = extractGooglePlaceAddress(place);
          if (!extracted) {
            setSelectionError('Não foi possível obter a localização desse endereço. Tente selecionar outra sugestão.');
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
    <div className="flex flex-col gap-1">
      <Input
        ref={inputRef}
        label="Buscar endereço de entrega"
        placeholder="Digite rua, número, bairro ou CEP"
        required
        disabled={disabled || isLoading || Boolean(loadError)}
        onChange={() => {
          setSelectionError(null);
          onInputChange?.();
        }}
        autoComplete="off"
      />
      <p className="text-xs text-on-surface-variant">
        Selecione uma sugestão para validar a localização de entrega.
      </p>
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

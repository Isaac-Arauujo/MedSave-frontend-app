import { useEffect, useRef, useState } from 'react';
import {
  extractGooglePlaceAddress,
  isCepOnlySearchInput,
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
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setSearchValue('');
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
            setSelectionError('Não foi possível obter a localização desse endereço. Tente selecionar outra sugestão.');
            return;
          }

          const extracted = extractGooglePlaceAddress(place);
          if (!extracted) {
            setSelectionError('Não foi possível obter a localização desse endereço. Tente selecionar outra sugestão.');
            return;
          }

          setSelectionError(null);
          setSearchValue(inputRef.current?.value ?? extracted.formattedAddress);
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

  const cepOnlyInput = isCepOnlySearchInput(searchValue);

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={inputRef}
        label="Busque seu endereço com número"
        placeholder="Ex: Rua Exemplo , 123, São Paulo"
        required
        disabled={disabled || isLoading || Boolean(loadError)}
        onChange={(event) => {
          const value = event.target.value;
          setSearchValue(value);
          setSelectionError(null);
          onInputChange?.(value);
        }}
        autoComplete="off"
      />

      <p className="text-xs text-on-surface-variant">
        Digite o endereço completo com número e selecione uma sugestão da lista. Não use apenas o CEP.
      </p>

      <div className="space-y-1 text-xs text-on-surface-variant">
        <p>Exemplo correto: Rua Robert Bird, 137, São Paulo</p>
        <p>Evite buscar apenas por CEP.</p>
      </div>

      {cepOnlyInput && (
        <p className="text-xs text-[var(--color-warning)]" role="alert">
          Digite a rua com o número. O CEP sozinho não localiza o endereço para entrega.
        </p>
      )}

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

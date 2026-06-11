import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';
import * as pharmacyProductApi from '../../api/pharmacyProductApi';
import type { PharmacyProductSummary } from '../../types/ProductTypes';
import { handleApiError } from '../../utils/handleApiError';
import { shouldSearchPharmacyProducts } from '../../utils/productEan';
import { getProductPrescriptionLabel } from '../../utils/productPrescriptionLabel';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_PAGE_SIZE = 20;

interface ProductMasterSearchSelectProps {
  value: PharmacyProductSummary | null;
  onChange: (product: PharmacyProductSummary | null) => void;
  disabled?: boolean;
  error?: string;
}

const formatMetaLine = (product: PharmacyProductSummary): string => {
  const parts = [
    product.manufacturer || product.brand,
    product.presentation,
    product.ean ? `EAN ${product.ean}` : undefined,
  ].filter(Boolean);
  return parts.join(' · ');
};

const ProductSummaryCard = ({
  product,
  onChangeProduct,
  readonly = false,
}: {
  product: PharmacyProductSummary;
  onChangeProduct?: () => void;
  readonly?: boolean;
}) => (
  <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
    <div className="mb-3 flex items-start justify-between gap-3">
      <p className="text-sm font-semibold text-on-surface">Produto selecionado</p>
      {!readonly && onChangeProduct && (
        <Button variant="ghost" size="sm" onClick={onChangeProduct}>
          Trocar produto
        </Button>
      )}
    </div>

    <div className="flex gap-3">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl border border-outline-variant object-cover"
        />
      ) : (
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest text-xs text-on-surface-variant"
          aria-hidden="true"
        >
          Sem foto
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="font-medium text-on-surface">{product.name}</p>
        {formatMetaLine(product) && (
          <p className="mt-1 text-sm text-on-surface-variant">{formatMetaLine(product)}</p>
        )}
        {product.activeIngredient && (
          <p className="mt-1 text-sm text-on-surface-variant">
            Princípio ativo: {product.activeIngredient}
          </p>
        )}
        {product.msRegistration && (
          <p className="text-sm text-on-surface-variant">Registro MS: {product.msRegistration}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={product.requiresPrescription ? 'warning' : 'neutral'}>
            {getProductPrescriptionLabel(product)}
          </Badge>
          {!product.allowOnlineSale && (
            <Badge variant="danger">Venda online bloqueada</Badge>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const ProductMasterSearchSelect = ({
  value,
  onChange,
  disabled = false,
  error,
}: ProductMasterSearchSelectProps) => {
  const listboxId = useId();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<PharmacyProductSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (disabled || value) {
      setSearch('');
      setResults([]);
      setHasSearched(false);
      setSearchError(null);
      return;
    }

    if (!shouldSearchPharmacyProducts(search)) {
      setResults([]);
      setHasSearched(false);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          setIsSearching(true);
          setSearchError(null);
          const response = await pharmacyProductApi.searchPharmacyProducts({
            search: search.trim(),
            page: 0,
            size: SEARCH_PAGE_SIZE,
          });

          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          setResults(response.content);
          setHasSearched(true);
        } catch (err) {
          if (currentRequestId !== requestIdRef.current) {
            return;
          }
          setSearchError('Não foi possível buscar produtos agora. Tente novamente.');
          setResults([]);
          setHasSearched(true);
          console.error(handleApiError(err));
        } finally {
          if (currentRequestId === requestIdRef.current) {
            setIsSearching(false);
          }
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search, disabled, value]);

  const handleSelect = (product: PharmacyProductSummary) => {
    if (!product.allowOnlineSale) {
      return;
    }
    onChange(product);
    setSearch('');
    setResults([]);
    setHasSearched(false);
  };

  if (value) {
    return (
      <ProductSummaryCard
        product={value}
        readonly={disabled}
        onChangeProduct={disabled ? undefined : () => onChange(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Buscar produto por nome, EAN, fabricante ou princípio ativo"
        placeholder="Digite para buscar no catálogo mestre"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        disabled={disabled}
        error={error}
      />

      {isSearching && (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant" aria-live="polite">
          <Spinner size="sm" />
          Buscando produtos...
        </div>
      )}

      {searchError && (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {searchError}
        </p>
      )}

      {hasSearched && !isSearching && results.length === 0 && !searchError && (
        <p className="rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          Nenhum produto encontrado. Confira o EAN ou busque pelo nome/fabricante.
        </p>
      )}

      {results.length > 0 && (
        <ul
          id={listboxId}
          className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-outline-variant p-2"
          role="listbox"
          aria-label="Resultados da busca de produtos"
        >
          {results.map((product) => {
            const blocked = !product.allowOnlineSale;

            return (
              <li key={product.id}>
                <button
                  type="button"
                  role="option"
                  disabled={blocked}
                  onClick={() => handleSelect(product)}
                  className={clsx(
                    'flex w-full gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                    blocked
                      ? 'cursor-not-allowed border-outline-variant bg-surface-container-low opacity-70'
                      : 'border-transparent hover:border-primary/30 hover:bg-primary/5'
                  )}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg border border-outline-variant object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest text-[10px] text-on-surface-variant">
                      Sem foto
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-on-surface">{product.name}</p>
                    {formatMetaLine(product) && (
                      <p className="mt-1 text-sm text-on-surface-variant">{formatMetaLine(product)}</p>
                    )}
                    {product.activeIngredient && (
                      <p className="text-sm text-on-surface-variant">
                        Princípio ativo: {product.activeIngredient}
                      </p>
                    )}
                    {product.msRegistration && (
                      <p className="text-sm text-on-surface-variant">
                        Registro MS: {product.msRegistration}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={product.requiresPrescription ? 'warning' : 'neutral'}>
                        Receita: {getProductPrescriptionLabel(product)}
                      </Badge>
                      {blocked && (
                        <Badge variant="danger">Venda online bloqueada</Badge>
                      )}
                    </div>
                    {blocked && (
                      <p className="mt-2 text-sm text-[var(--color-danger)]">
                        Este produto não está disponível para venda online no MediSave.
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

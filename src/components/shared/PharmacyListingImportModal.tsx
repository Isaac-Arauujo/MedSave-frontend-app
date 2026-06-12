import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { downloadListingImportTemplate } from '../../api/listingApi';
import type { ListingImportResultResponse, ListingImportRowResult } from '../../types/ListingTypes';
import {
  downloadImportReportCsv,
  filterImportRows,
  getImportRowMessage,
  getImportStatusLabel,
  type ListingImportStatusFilter,
} from '../../utils/listingImportReportUtils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../utils/formatDate';
import { handleApiError } from '../../utils/handleApiError';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const STATUS_FILTERS: { id: ListingImportStatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'CREATED', label: 'Criados' },
  { id: 'UPDATED', label: 'Atualizados' },
  { id: 'ERROR', label: 'Erros' },
];

interface PharmacyListingImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ListingImportResultResponse>;
  isSubmitting?: boolean;
}

const statusBadgeClass = (status: ListingImportRowResult['status']) => {
  switch (status) {
    case 'CREATED':
      return 'success' as const;
    case 'UPDATED':
      return 'neutral' as const;
    case 'ERROR':
      return 'danger' as const;
    default:
      return 'neutral' as const;
  }
};

const validateCsvFile = (file: File): string | null => {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return 'Envie um arquivo CSV válido.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'O arquivo excede o limite permitido.';
  }
  return null;
};

const resetImportState = (
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  setSelectedFile: (file: File | null) => void,
  setResult: (result: ListingImportResultResponse | null) => void,
  setStatusFilter: (filter: ListingImportStatusFilter) => void,
  setSearchQuery: (query: string) => void
) => {
  setSelectedFile(null);
  setResult(null);
  setStatusFilter('ALL');
  setSearchQuery('');
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

const ImportResultTableRow = ({ row }: { row: ListingImportRowResult }) => (
  <tr>
    <td className="px-3 py-2">{row.line}</td>
    <td className="px-3 py-2">{row.ean ?? '—'}</td>
    <td className="px-3 py-2">{row.productName ?? '—'}</td>
    <td className="px-3 py-2">{row.batchNumber ?? '—'}</td>
    <td className="px-3 py-2">
      {row.expirationDate ? formatDate(row.expirationDate) : '—'}
    </td>
    <td className="px-3 py-2">
      <Badge
        variant={statusBadgeClass(row.status)}
        className={row.status === 'UPDATED' ? 'bg-blue-100 text-blue-700' : undefined}
      >
        {getImportStatusLabel(row.status)}
      </Badge>
    </td>
    <td className="px-3 py-2 text-gray-700">{getImportRowMessage(row)}</td>
  </tr>
);

export const PharmacyListingImportModal = ({
  isOpen,
  onClose,
  onImport,
  isSubmitting = false,
}: PharmacyListingImportModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<ListingImportResultResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<ListingImportStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = useMemo(
    () => (result ? filterImportRows(result.rows, statusFilter, searchQuery) : []),
    [result, statusFilter, searchQuery]
  );

  const handleClose = () => {
    resetImportState(fileInputRef, setSelectedFile, setResult, setStatusFilter, setSearchQuery);
    onClose();
  };

  const handleImportAnother = () => {
    resetImportState(fileInputRef, setSelectedFile, setResult, setStatusFilter, setSearchQuery);
  };

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const validationError = validateCsvFile(file);
    if (validationError) {
      toast.error(validationError);
      event.target.value = '';
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      await downloadListingImportTemplate();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo CSV.');
      return;
    }
    if (isSubmitting) {
      return;
    }

    try {
      const importResult = await onImport(selectedFile);
      setResult(importResult);
      setStatusFilter('ALL');
      setSearchQuery('');

      if (importResult.errorCount === 0) {
        toast.success('Importação concluída com sucesso.');
      } else if (importResult.createdCount > 0 || importResult.updatedCount > 0) {
        toast.error('Importação concluída com alguns erros. Confira o relatório abaixo.');
      } else {
        toast.error('Nenhuma linha foi importada. Confira o relatório abaixo.');
      }
    } catch {
      // Error toast handled by hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar anúncios por CSV"
      size="xl"
      footer={
        result ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button variant="secondary" onClick={() => downloadImportReportCsv(result.rows)}>
              Baixar relatório
            </Button>
            {result.errorCount > 0 && (
              <Button variant="secondary" onClick={() => downloadImportReportCsv(result.rows, true)}>
                Baixar apenas erros
              </Button>
            )}
            <Button variant="secondary" onClick={handleImportAnother}>
              Importar outro arquivo
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleImport()}
              isLoading={isSubmitting}
              disabled={!selectedFile || isSubmitting}
            >
              Importar
            </Button>
          </>
        )
      }
    >
      <div className="space-y-5">
        {!result && (
          <>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
              <li>Baixe o modelo CSV.</li>
              <li>Abra o arquivo no Excel ou Google Sheets.</li>
              <li>Preencha uma linha para cada produto/lote.</li>
              <li>Salve o arquivo como CSV.</li>
              <li>Envie o CSV aqui para criar ou atualizar anúncios.</li>
            </ol>

            <p className="text-sm text-gray-600">
              Dica: o modelo usa ponto e vírgula para abrir melhor em colunas no Excel.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                variant="secondary"
                onClick={() => void handleDownloadTemplate()}
                isLoading={isDownloadingTemplate}
                className="w-full sm:w-auto"
              >
                Baixar modelo CSV para Excel
              </Button>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto"
              >
                Selecionar CSV para importar
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleSelectFile}
              />
            </div>

            {selectedFile && (
              <p className="text-sm text-gray-700">
                Arquivo selecionado: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
          </>
        )}

        {result && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Importação concluída</h3>
              <p className="mt-1 text-sm text-gray-600">
                Confira o resumo abaixo e baixe o relatório para corrigir erros, se necessário.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{result.totalRows}</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-green-700">Criados</p>
                <p className="mt-1 text-2xl font-semibold text-green-800">{result.createdCount}</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  Atualizados
                </p>
                <p className="mt-1 text-2xl font-semibold text-blue-800">{result.updatedCount}</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-red-700">Erros</p>
                <p className="mt-1 text-2xl font-semibold text-red-800">{result.errorCount}</p>
              </div>
            </div>

            {result.errorCount > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Como corrigir os erros?</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Produto não encontrado: confira se o EAN existe no catálogo mestre.</li>
                  <li>EAN inválido: use 8, 12, 13 ou 14 dígitos.</li>
                  <li>Preço inválido: use formato 12,90 ou 12.90.</li>
                  <li>Validade inválida: use 30/08/2026 ou 2026-08-30.</li>
                  <li>Lote inválido: preencha o lote impresso na embalagem.</li>
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={statusFilter === filter.id ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setStatusFilter(filter.id)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              <div className="w-full lg:max-w-xs">
                <Input
                  label="Buscar no resultado"
                  placeholder="EAN, produto, lote, mensagem..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
                Nenhuma linha encontrada com os filtros atuais.
              </p>
            ) : (
              <>
                <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Linha</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">EAN</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Produto</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Lote</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Validade</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Mensagem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredRows.map((row) => (
                        <ImportResultTableRow key={row.line} row={row} />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 md:hidden">
                  {filteredRows.map((row) => (
                    <div
                      key={row.line}
                      className="rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{row.productName ?? '—'}</p>
                          <p className="mt-1 text-xs text-gray-500">Linha {row.line}</p>
                        </div>
                        <Badge
                          variant={statusBadgeClass(row.status)}
                          className={row.status === 'UPDATED' ? 'bg-blue-100 text-blue-700' : undefined}
                        >
                          {getImportStatusLabel(row.status)}
                        </Badge>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600">
                        <div>
                          <dt className="font-medium text-gray-500">EAN</dt>
                          <dd className="mt-0.5 text-gray-800">{row.ean ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Lote</dt>
                          <dd className="mt-0.5 text-gray-800">{row.batchNumber ?? '—'}</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="font-medium text-gray-500">Validade</dt>
                          <dd className="mt-0.5 text-gray-800">
                            {row.expirationDate ? formatDate(row.expirationDate) : '—'}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="font-medium text-gray-500">Mensagem</dt>
                          <dd className="mt-0.5 text-gray-800">{getImportRowMessage(row)}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

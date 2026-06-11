import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { downloadListingImportTemplate } from '../../api/listingApi';
import type { ListingImportResultResponse, ListingImportRowResult } from '../../types/ListingTypes';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../utils/formatDate';
import { handleApiError } from '../../utils/handleApiError';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

interface PharmacyListingImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ListingImportResultResponse>;
  isSubmitting?: boolean;
}

const statusLabel = (status: ListingImportRowResult['status']) => {
  switch (status) {
    case 'CREATED':
      return 'Criado';
    case 'UPDATED':
      return 'Atualizado';
    case 'ERROR':
      return 'Erro';
    default:
      return status;
  }
};

const statusVariant = (status: ListingImportRowResult['status']) => {
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

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
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

    try {
      const importResult = await onImport(selectedFile);
      setResult(importResult);

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
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            {result ? 'Fechar' : 'Cancelar'}
          </Button>
          {!result && (
            <Button
              variant="primary"
              onClick={() => void handleImport()}
              isLoading={isSubmitting}
              disabled={!selectedFile}
            >
              Importar
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
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

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => void handleDownloadTemplate()}
            isLoading={isDownloadingTemplate}
          >
            Baixar modelo CSV para Excel
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
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

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-gray-500">Total de linhas</p>
                <p className="text-lg font-semibold text-gray-900">{result.totalRows}</p>
              </div>
              <div>
                <p className="text-gray-500">Criados</p>
                <p className="text-lg font-semibold text-green-700">{result.createdCount}</p>
              </div>
              <div>
                <p className="text-gray-500">Atualizados</p>
                <p className="text-lg font-semibold text-blue-700">{result.updatedCount}</p>
              </div>
              <div>
                <p className="text-gray-500">Erros</p>
                <p className="text-lg font-semibold text-red-700">{result.errorCount}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                  {result.rows.map((row) => (
                    <tr key={row.line}>
                      <td className="px-3 py-2">{row.line}</td>
                      <td className="px-3 py-2">{row.ean ?? '—'}</td>
                      <td className="px-3 py-2">{row.productName ?? '—'}</td>
                      <td className="px-3 py-2">{row.batchNumber ?? '—'}</td>
                      <td className="px-3 py-2">
                        {row.expirationDate ? formatDate(row.expirationDate) : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                      </td>
                      <td className="px-3 py-2 text-gray-700">{row.message ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

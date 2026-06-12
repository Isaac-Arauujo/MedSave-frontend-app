import type { ListingImportRowResult, ListingImportStatus } from '../types/ListingTypes';
import { formatDate } from './formatDate';

export type ListingImportStatusFilter = 'ALL' | ListingImportStatus;

export const LISTING_IMPORT_ERROR_LABELS: Record<string, string> = {
  PRODUCT_EAN_NOT_FOUND: 'Produto não encontrado no catálogo mestre.',
  INVALID_EAN: 'EAN/GTIN inválido.',
  INVALID_ORIGINAL_PRICE: 'Preço original inválido.',
  INVALID_DISCOUNT_PRICE: 'Preço promocional inválido.',
  INVALID_PRICE: 'Preço inválido.',
  DISCOUNT_PRICE_NOT_LOWER: 'O preço promocional deve ser menor que o preço original.',
  INVALID_STOCK: 'Estoque inválido.',
  INVALID_EXPIRATION_DATE: 'Validade inválida ou vencida.',
  INVALID_BATCH_NUMBER: 'Lote inválido.',
  DUPLICATE_ROW: 'Linha duplicada no arquivo para o mesmo EAN, lote e validade.',
  PRODUCT_ONLINE_SALE_NOT_ALLOWED: 'Produto não disponível para venda online.',
  STOCK_BELOW_RESERVED: 'O estoque informado não pode ser menor que o estoque já reservado.',
};

export const getImportStatusLabel = (status: ListingImportStatus): string => {
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

export const getImportStatusCsvLabel = (status: ListingImportStatus): string => {
  switch (status) {
    case 'CREATED':
      return 'CRIADO';
    case 'UPDATED':
      return 'ATUALIZADO';
    case 'ERROR':
      return 'ERRO';
    default:
      return status;
  }
};

export const getImportRowMessage = (row: ListingImportRowResult): string => {
  if (row.message?.trim()) {
    return row.message.trim();
  }
  if (row.code && LISTING_IMPORT_ERROR_LABELS[row.code]) {
    return LISTING_IMPORT_ERROR_LABELS[row.code];
  }
  return '—';
};

const escapeCsvField = (value: string): string => {
  if (/[;"\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const formatRowExpiration = (expirationDate?: string): string => {
  if (!expirationDate) {
    return '';
  }
  return formatDate(expirationDate);
};

export const buildImportReportCsv = (
  rows: ListingImportRowResult[],
  errorsOnly = false
): string => {
  const filteredRows = errorsOnly ? rows.filter((row) => row.status === 'ERROR') : rows;
  const header = 'linha;ean;produto;lote;validade;status;codigo;mensagem';
  const lines = filteredRows.map((row) =>
    [
      String(row.line),
      row.ean ?? '',
      row.productName ?? '',
      row.batchNumber ?? '',
      formatRowExpiration(row.expirationDate),
      getImportStatusCsvLabel(row.status),
      row.code ?? '',
      getImportRowMessage(row),
    ]
      .map(escapeCsvField)
      .join(';')
  );
  return [header, ...lines].join('\r\n');
};

export const downloadImportReportCsv = (
  rows: ListingImportRowResult[],
  errorsOnly = false
): void => {
  const content = buildImportReportCsv(rows, errorsOnly);
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = errorsOnly
    ? 'medisave-relatorio-importacao-erros.csv'
    : 'medisave-relatorio-importacao.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const filterImportRows = (
  rows: ListingImportRowResult[],
  statusFilter: ListingImportStatusFilter,
  searchQuery: string
): ListingImportRowResult[] => {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return rows.filter((row) => {
    if (statusFilter !== 'ALL' && row.status !== statusFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      row.ean,
      row.productName,
      row.batchNumber,
      row.code,
      getImportRowMessage(row),
      getImportStatusLabel(row.status),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
};

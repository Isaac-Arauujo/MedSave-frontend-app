import { useEffect, useId, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadProductImages } from '../../api/adminApi';
import { Spinner } from '../ui/Spinner';
import { getImageUrl } from '../../utils/getImageUrl';
import { handleApiError } from '../../utils/handleApiError';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;

interface UploadedImageItem {
  id: string;
  url: string;
  previewUrl: string;
  label: string;
  isUploading?: boolean;
  error?: string;
}

interface ProductImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

const mapUploadError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 413) {
      return 'Imagem muito grande. O limite é 5 MB.';
    }
  }

  const message = handleApiError(error);
  if (message.toLowerCase().includes('5 mb') || message.toLowerCase().includes('5mb')) {
    return 'Imagem muito grande. O limite é 5 MB.';
  }
  if (message.toLowerCase().includes('inválido') || message.toLowerCase().includes('permitido')) {
    return 'Arquivo inválido. Envie uma imagem PNG, JPG ou WEBP.';
  }
  return message || 'Não foi possível enviar a imagem. Tente novamente.';
};

const validateFile = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Arquivo inválido. Envie uma imagem PNG, JPG ou WEBP.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Imagem muito grande. O limite é 5 MB.';
  }
  return null;
};

const toPreviewUrl = (url: string) => getImageUrl(url) ?? url;

const mapUrlsToItems = (urls: string[]): UploadedImageItem[] =>
  urls.map((url, index) => ({
    id: `${url}-${index}`,
    url,
    previewUrl: toPreviewUrl(url),
    label: 'Imagem enviada',
  }));

export const ProductImageUploader = ({ value, onChange, disabled = false }: ProductImageUploaderProps) => {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadedImageItem[]>(() => mapUrlsToItems(value));
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setItems(mapUrlsToItems(value));
  }, [value]);

  const uploadSingleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const uploadedCount = items.filter((item) => item.url && !item.error).length;
    if (uploadedCount >= MAX_FILES) {
      toast.error(`Envie no máximo ${MAX_FILES} imagens por produto.`);
      return;
    }

    const tempId = `${file.name}-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    const pendingItem: UploadedImageItem = {
      id: tempId,
      url: '',
      previewUrl,
      label: file.name,
      isUploading: true,
    };

    setItems((current) => [...current, pendingItem]);

    try {
      const response = await uploadProductImages([file]);
      const uploaded = response.images[0];
      if (!uploaded?.url) {
        throw new Error('Resposta de upload inválida.');
      }

      setItems((current) => {
        const next = current.map((item) =>
          item.id === tempId
            ? {
                id: uploaded.url,
                url: uploaded.url,
                previewUrl: toPreviewUrl(uploaded.url),
                label: 'Imagem enviada',
              }
            : item
        );
        onChange(next.filter((item) => item.url).map((item) => item.url));
        return next;
      });
    } catch (error) {
      setItems((current) =>
        current.map((item) =>
          item.id === tempId
            ? {
                ...item,
                isUploading: false,
                error: mapUploadError(error),
              }
            : item
        )
      );
      toast.error(mapUploadError(error));
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    if (disabled) {
      return;
    }

    Array.from(files).forEach((file) => {
      void uploadSingleFile(file);
    });
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const clipboardItems = event.clipboardData?.items;
    if (!clipboardItems) {
      return;
    }

    let handled = false;
    for (const item of clipboardItems) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handled = true;
          void uploadSingleFile(file);
        }
      }
    }

    if (!handled) {
      toast.error('Não foi possível colar a imagem. Tente enviar do computador.');
    }
  };

  const handleRemove = (id: string) => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      onChange(next.filter((item) => item.url).map((item) => item.url));
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <label htmlFor={inputId} className="text-sm font-medium text-on-surface">
        Imagens do produto
      </label>

      <div
        tabIndex={0}
        role="button"
        aria-label="Área de upload de imagens"
        onPaste={handlePaste}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragOver(true);
          }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          if (event.dataTransfer.files?.length) {
            handleFiles(event.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (!disabled) {
            fileInputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-outline-variant'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary'}`}
      >
        <p className="text-sm text-on-surface">
          Arraste imagens aqui, clique para enviar ou cole com Ctrl+V
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">
          Formatos aceitos: PNG, JPG ou WEBP. Máx. 5 MB por imagem.
        </p>
      </div>

      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files?.length) {
            handleFiles(event.target.files);
            event.target.value = '';
          }
        }}
      />

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest"
            >
              <img src={item.previewUrl} alt={item.label} className="h-28 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-xs text-on-surface-variant">{item.label}</span>
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--color-danger)]"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove(item.id);
                  }}
                  disabled={disabled || item.isUploading}
                >
                  Remover
                </button>
              </div>
              {item.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Spinner size="sm" />
                </div>
              )}
              {item.error && (
                <p className="px-3 pb-2 text-xs text-[var(--color-danger)]">{item.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

import { useState, useRef } from 'react'
import { uploadImage } from '../api/axios'

const ImageUpload = ({ currentImage, onImageUpload, onImageRemove }) => {
  const [preview, setPreview] = useState(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida')
      return
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB')
      return
    }

    // Mostrar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Fazer upload para o backend
    setUploading(true)
    try {
      const imageUrl = await uploadImage(file)
      console.log('Imagem uploaded:', imageUrl)
      onImageUpload(imageUrl)
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload da imagem')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleFileSelect({ target: { files: [file] } })
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Capturar Ctrl+V
  useState(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            // Simular clique no input com o arquivo colado
            const input = fileInputRef.current
            if (input) {
              const dataTransfer = new DataTransfer()
              dataTransfer.items.add(file)
              input.files = dataTransfer.files
              handleFileSelect({ target: { files: [file] } })
            }
          }
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-on-surface mb-1">
        Imagem do Produto
      </label>

      {/* Área de upload/preview */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-4 transition-colors
          ${preview ? 'border-primary' : 'border-outline-variant/30 hover:border-primary'}
          ${uploading ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {uploading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-on-surface-variant">Enviando imagem...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/90 transition-colors"
              title="Remover imagem"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">
              cloud_upload
            </span>
            <p className="text-sm text-on-surface-variant mb-2">
              Arraste uma imagem, clique para selecionar ou cole (Ctrl+V)
            </p>
            <p className="text-xs text-outline">
              PNG, JPG ou GIF (máx. 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Botão para selecionar arquivo (quando não tem preview e não está uploading) */}
      {!preview && !uploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-2 border border-outline-variant/30 rounded-md text-sm hover:bg-surface-container-low transition-colors"
        >
          Selecionar imagem
        </button>
      )}
    </div>
  )
}

export default ImageUpload
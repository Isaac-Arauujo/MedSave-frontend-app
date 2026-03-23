import { useState, useEffect } from 'react'
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct } from '../api/axios'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ImageUpload from '../components/ImageUpload'

const Admin = () => {
  const [products, setProducts] = useState([])
  const [farmacias, setFarmacias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    precoOriginal: '',
    precoDesconto: '',
    dataValidade: '',
    imagemUrl: '',
    status: 'ATIVO',
    farmaciaId: ''
  })

  // Carregar produtos e farmácias
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsData, farmaciasData] = await Promise.all([
        getAllProductsAdmin(),
        axios.get('http://localhost:8080/api/farmacias').then(res => res.data)
      ])
      setProducts(productsData)
      setFarmacias(farmaciasData)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar dados')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal para criar/editar
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        nome: product.nome || '',
        descricao: product.descricao || '',
        precoOriginal: product.precoOriginal || '',
        precoDesconto: product.precoDesconto || '',
        dataValidade: product.dataValidade || '',
        imagemUrl: product.imagemUrl || '',
        status: product.status || 'ATIVO',
        farmaciaId: product.farmacia?.id || ''  // 👈 PEGA O ID DA FARMÁCIA
      })
    } else {
      setEditingProduct(null)
      setFormData({
        nome: '',
        descricao: '',
        precoOriginal: '',
        precoDesconto: '',
        dataValidade: '',
        imagemUrl: '',
        status: 'ATIVO',
        farmaciaId: ''
      })
    }
    setShowModal(true)
  }

  // Fechar modal
  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  // Lidar com mudanças no form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Salvar produto (criar ou atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const precoOriginalValue = parseFloat(formData.precoOriginal)
      let precoDescontoValue = formData.precoDesconto 
        ? parseFloat(formData.precoDesconto) 
        : precoOriginalValue

      if (precoDescontoValue > precoOriginalValue) {
        precoDescontoValue = precoOriginalValue
      }

      const productData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao?.trim() || null,
        precoOriginal: precoOriginalValue,
        precoDesconto: precoDescontoValue,
        dataValidade: formData.dataValidade,
        imagemUrl: formData.imagemUrl?.trim() || null,
        status: formData.status,
        farmaciaId: formData.farmaciaId ? parseInt(formData.farmaciaId) : null  // 👈 ENVIA O ID DA FARMÁCIA
      }

      console.log('📤 Enviando dados:', productData)

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await createProduct(productData)
      }
      
      await fetchData()  // Recarrega produtos e farmácias
      closeModal()
    } catch (err) {
      console.error('❌ Erro completo:', err.response?.data)
      
      let errorMessage = 'Erro ao salvar produto'
      if (err.response?.data?.fieldErrors) {
        errorMessage = Object.entries(err.response.data.fieldErrors)
          .map(([campo, erro]) => `${campo}: ${erro}`)
          .join('\n')
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      alert(errorMessage)
    }
  }

  // Deletar produto
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return
    
    try {
      await deleteProduct(id)
      await fetchData()
    } catch (err) {
      alert('Erro ao deletar produto: ' + err.message)
    }
  }

  // Nome da farmácia pelo ID
  const getFarmaciaNome = (farmaciaId) => {
    const farmacia = farmacias.find(f => f.id === farmaciaId)
    return farmacia ? farmacia.nome : 'Não vinculado'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="pt-24 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-24 bottom-0 bg-surface-container-low px-6 py-8 hidden lg:block">
        <div className="space-y-6">
          <div>
            <p className="text-[0.7rem] uppercase tracking-widest text-outline font-bold mb-4 px-4">Navigation</p>
            <nav className="space-y-1">
              <button className="flex items-center space-x-3 px-4 py-3 rounded-full bg-white shadow-sm text-primary transition-all w-full">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                <span className="font-bold">Produtos</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 px-8 pb-12">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-tertiary tracking-tight mb-2">
                Gerenciamento de Produtos
              </h1>
              <p className="text-slate-500 font-body">Gerencie o catálogo de produtos da MedSave.</p>
            </div>
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
              Adicionar Produto
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg">
              {error}
            </div>
          )}

          {/* Products Table */}
          <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-tertiary uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-4 text-xs font-bold text-tertiary uppercase tracking-wider">Farmácia</th>
                  <th className="px-6 py-4 text-xs font-bold text-tertiary uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-4 text-xs font-bold text-tertiary uppercase tracking-wider">Validade</th>
                  <th className="px-6 py-4 text-xs font-bold text-tertiary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-tertiary uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                          {product.imagemUrl ? (
                            <img 
                              alt={product.nome} 
                              className="h-full w-full object-cover" 
                              src={`http://localhost:8080${product.imagemUrl}`}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-surface-container-high">
                              <span className="material-symbols-outlined text-outline">image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{product.nome}</div>
                          <div className="text-xs text-slate-400">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm">
                        {product.farmacia ? (
                          <div>
                            <span className="font-medium text-tertiary">{product.farmacia.nome}</span>
                            <span className="text-xs text-slate-500 block">{product.farmacia.cidade}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Não vinculado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-on-surface">
                        R$ {product.precoDesconto?.toFixed(2)}
                      </div>
                      {product.precoDesconto !== product.precoOriginal && (
                        <div className="text-xs text-primary font-medium">
                          De: R$ {product.precoOriginal?.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-on-surface">
                        {new Date(product.dataValidade).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.7rem] font-bold ${
                        product.status === 'ATIVO' 
                          ? 'bg-primary-container/20 text-on-primary-fixed-variant' 
                          : product.status === 'ULTIMAS_UNIDADES'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-error-container/20 text-on-error-container'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          product.status === 'ATIVO' ? 'bg-primary-container' : 
                          product.status === 'ULTIMAS_UNIDADES' ? 'bg-yellow-500' : 'bg-error'
                        }`}></span>
                        {product.status === 'ULTIMAS_UNIDADES' ? 'Últimas Unidades' : product.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button 
                        onClick={() => openModal(product)}
                        className="p-2 text-slate-400 hover:text-tertiary transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-error transition-colors"
                        title="Deletar"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-slate-500">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Criar/Editar Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-tertiary mb-6">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Nome <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Preço Original <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    name="precoOriginal"
                    value={formData.precoOriginal}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Preço com Desconto <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    name="precoDesconto"
                    value={formData.precoDesconto}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Se não houver desconto, use o mesmo valor do preço original
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Data de Validade <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  name="dataValidade"
                  value={formData.dataValidade}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* 👇 SELECT DE FARMÁCIA */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Farmácia
                </label>
                <select
                  name="farmaciaId"
                  value={formData.farmaciaId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Selecione uma farmácia (opcional)</option>
                  {farmacias.map(farmacia => (
                    <option key={farmacia.id} value={farmacia.id}>
                      {farmacia.nome} - {farmacia.cidade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Componente de Upload de Imagem */}
              <ImageUpload
                currentImage={formData.imagemUrl ? `http://localhost:8080${formData.imagemUrl}` : null}
                onImageUpload={(imageUrl) => {
                  setFormData(prev => ({ ...prev, imagemUrl: imageUrl }))
                }}
                onImageRemove={() => {
                  setFormData(prev => ({ ...prev, imagemUrl: '' }))
                }}
              />

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Status <span className="text-error">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="ULTIMAS_UNIDADES">Últimas Unidades</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 rounded-full border border-outline-variant/30 text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  {editingProduct ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
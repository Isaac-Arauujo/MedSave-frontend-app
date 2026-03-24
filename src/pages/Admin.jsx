import { useState, useEffect } from 'react'
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct } from '../api/axios'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import ImageUpload from '../components/ImageUpload'
import { Link } from 'react-router-dom'

const Admin = () => {
  const [products, setProducts] = useState([])
  const [farmacias, setFarmacias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('produtos')
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
        farmaciaId: product.farmacia?.id || ''
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

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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
        farmaciaId: formData.farmaciaId ? parseInt(formData.farmaciaId) : null
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await createProduct(productData)
      }
      
      await fetchData()
      closeModal()
    } catch (err) {
      console.error('Erro:', err.response?.data)
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

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return
    try {
      await deleteProduct(id)
      await fetchData()
    } catch (err) {
      alert('Erro ao deletar produto: ' + err.message)
    }
  }

  const handleDeleteFarmacia = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta farmácia?')) return
    try {
      await axios.delete(`http://localhost:8080/api/farmacias/${id}`)
      await fetchData()
      alert('Farmácia deletada com sucesso!')
    } catch (err) {
      alert('Erro ao deletar farmácia')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="pt-20 md:pt-24 min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Responsiva */}
      <aside className="w-full md:w-64 md:fixed md:left-0 md:top-20 md:bottom-0 bg-gray-100 px-4 md:px-6 py-4 md:py-8 border-b md:border-b-0 md:border-r border-gray-200">
        <div className="flex md:block overflow-x-auto md:overflow-x-visible gap-2 md:gap-0">
          <div className="md:space-y-6 w-full">
            <p className="hidden md:block text-[0.7rem] uppercase tracking-widest text-gray-500 font-bold mb-4 px-4">Navigation</p>
            <div className="flex md:flex-col gap-1">
              <button
                onClick={() => setActiveTab('produtos')}
                className={`flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-full transition-all ${
                  activeTab === 'produtos'
                    ? 'bg-white shadow-sm text-green-600'
                    : 'text-gray-500 hover:bg-white'
                }`}
              >
                <span className="material-symbols-outlined text-base md:text-lg">inventory_2</span>
                <span className="font-bold text-sm md:text-base">Produtos</span>
              </button>
              
              <button
                onClick={() => setActiveTab('farmacias')}
                className={`flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-full transition-all ${
                  activeTab === 'farmacias'
                    ? 'bg-white shadow-sm text-green-600'
                    : 'text-gray-500 hover:bg-white'
                }`}
              >
                <span className="material-symbols-outlined text-base md:text-lg">store</span>
                <span className="font-bold text-sm md:text-base">Farmácias</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Responsiva */}
      <main className="flex-1 md:ml-64 px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Responsivo */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {activeTab === 'produtos' ? 'Produtos' : 'Farmácias'}
              </h1>
              <p className="text-sm text-gray-500">
                {activeTab === 'produtos' 
                  ? 'Gerencie os produtos do catálogo'
                  : 'Gerencie as farmácias parceiras'}
              </p>
            </div>
            {activeTab === 'produtos' && (
              <button 
                onClick={() => openModal()}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Novo Produto
              </button>
            )}
            {activeTab === 'farmacias' && (
              <button 
                onClick={() => window.location.href = '/admin/farmacias'}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Nova Farmácia
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* TABELA DE PRODUTOS - Responsiva */}
          {activeTab === 'produtos' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Versão Desktop - Tabela normal */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Produto</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Farmácia</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Preço</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Validade</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              {product.imagemUrl ? (
                                <img src={`http://localhost:8080${product.imagemUrl}`} alt={product.nome} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <span className="material-symbols-outlined text-gray-400 text-sm">image</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{product.nome}</div>
                              <div className="text-xs text-gray-400">ID: {product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{product.farmacia?.nome || <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">R$ {product.precoDesconto?.toFixed(2)}</div>
                          {product.precoDesconto !== product.precoOriginal && (
                            <div className="text-xs text-gray-400 line-through">R$ {product.precoOriginal?.toFixed(2)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{new Date(product.dataValidade).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'ATIVO' ? 'bg-green-100 text-green-700' :
                            product.status === 'ULTIMAS_UNIDADES' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.status === 'ULTIMAS_UNIDADES' ? 'Últimas' : product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button onClick={() => openModal(product)} className="p-1 text-gray-400 hover:text-blue-600">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1 text-gray-400 hover:text-red-600">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Versão Mobile - Cards */}
              <div className="block md:hidden divide-y">
                {products.map((product) => (
                  <div key={product.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.imagemUrl ? (
                          <img src={`http://localhost:8080${product.imagemUrl}`} alt={product.nome} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="material-symbols-outlined text-gray-400">image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{product.nome}</div>
                        <div className="text-xs text-gray-400">ID: {product.id}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openModal(product)} className="p-2 text-gray-400 hover:text-blue-600">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Farmácia:</span>
                        <div>{product.farmacia?.nome || <span className="text-gray-400">-</span>}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Preço:</span>
                        <div className="font-medium">R$ {product.precoDesconto?.toFixed(2)}</div>
                        {product.precoDesconto !== product.precoOriginal && (
                          <div className="text-xs text-gray-400 line-through">R$ {product.precoOriginal?.toFixed(2)}</div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Validade:</span>
                        <div>{new Date(product.dataValidade).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          product.status === 'ATIVO' ? 'bg-green-100 text-green-700' :
                          product.status === 'ULTIMAS_UNIDADES' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.status === 'ULTIMAS_UNIDADES' ? 'Últimas' : product.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">Nenhum produto cadastrado</div>
              )}
            </div>
          )}

          {/* TABELA DE FARMÁCIAS - Responsiva */}
          {activeTab === 'farmacias' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Versão Desktop - Tabela normal */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Farmácia</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Endereço</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Cidade/UF</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Telefone</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {farmacias.map((farmacia) => (
                      <tr key={farmacia.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-400 text-sm">store</span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{farmacia.nome}</div>
                              <div className="text-xs text-gray-400">ID: {farmacia.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{farmacia.endereco}{farmacia.numero && `, ${farmacia.numero}`}</td>
                        <td className="px-4 py-3 text-sm">{farmacia.cidade} - {farmacia.estado}</td>
                        <td className="px-4 py-3 text-sm">{farmacia.telefone || '-'}</td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button 
                            onClick={() => window.location.href = `/admin/farmacias?edit=${farmacia.id}`}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteFarmacia(farmacia.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Versão Mobile - Cards */}
              <div className="block md:hidden divide-y">
                {farmacias.map((farmacia) => (
                  <div key={farmacia.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400">store</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{farmacia.nome}</div>
                        <div className="text-xs text-gray-400">ID: {farmacia.id}</div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => window.location.href = `/admin/farmacias?edit=${farmacia.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteFarmacia(farmacia.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-sm">
                      <div>
                        <span className="text-gray-500">Endereço:</span> {farmacia.endereco}{farmacia.numero && `, ${farmacia.numero}`}
                      </div>
                      <div>
                        <span className="text-gray-500">Cidade/UF:</span> {farmacia.cidade} - {farmacia.estado}
                      </div>
                      {farmacia.telefone && (
                        <div>
                          <span className="text-gray-500">Telefone:</span> {farmacia.telefone}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {farmacias.length === 0 && (
                <div className="text-center py-12 text-gray-500">Nenhuma farmácia cadastrada</div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Produto - Responsivo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preço Original *</label>
                  <input type="number" name="precoOriginal" value={formData.precoOriginal} onChange={handleInputChange} step="0.01" required className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preço com Desconto *</label>
                  <input type="number" name="precoDesconto" value={formData.precoDesconto} onChange={handleInputChange} step="0.01" required className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de Validade *</label>
                <input type="date" name="dataValidade" value={formData.dataValidade} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Farmácia</label>
                <select name="farmaciaId" value={formData.farmaciaId} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Selecione uma farmácia</option>
                  {farmacias.map(f => <option key={f.id} value={f.id}>{f.nome} - {f.cidade}</option>)}
                </select>
              </div>
              <ImageUpload
                currentImage={formData.imagemUrl ? `http://localhost:8080${formData.imagemUrl}` : null}
                onImageUpload={(url) => setFormData(prev => ({ ...prev, imagemUrl: url }))}
                onImageRemove={() => setFormData(prev => ({ ...prev, imagemUrl: '' }))}
              />
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="ULTIMAS_UNIDADES">Últimas Unidades</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
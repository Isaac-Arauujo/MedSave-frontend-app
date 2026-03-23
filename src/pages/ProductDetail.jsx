import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProducts } from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import { WHATSAPP_LINK } from '../utils/constants'
import MapaFarmacia from '../components/MapaFarmacia'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const products = await getProducts()
      const found = products.find(p => p.id === parseInt(id))
      
      if (found) {
        setProduct(found)
        setError(null)
      } else {
        setError('Produto não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar produto')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculateDiscount = () => {
    if (!product?.precoOriginal || !product?.precoDesconto) return 0
    return Math.round(((product.precoOriginal - product.precoDesconto) / product.precoOriginal) * 100)
  }

  const handleWhatsAppClick = () => {
    window.open(WHATSAPP_LINK(product), '_blank')
  }

  if (loading) return <LoadingSpinner />

  if (error || !product) {
    return (
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
        <p className="text-error font-bold">{error || 'Produto não encontrado'}</p>
        <Link 
          to="/catalog" 
          className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
        >
          Voltar ao catálogo
        </Link>
      </main>
    )
  }

  const discount = calculateDiscount()

  return (
    <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="mb-12 flex items-center gap-2 text-on-surface-variant text-sm font-medium">
        <Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">{product.nome}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative group">
            <div className="aspect-square bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex items-center justify-center p-12 transition-all duration-500 group-hover:shadow-xl">
              <img 
                alt={product.nome} 
                className="w-full h-full object-contain scale-90 group-hover:scale-100 transition-transform duration-700" 
                src={product.imagemUrl ? `http://localhost:8080${product.imagemUrl}` : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop'}
              />
            </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-5 space-y-10">
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-tertiary tracking-tight leading-tight">
              {product.nome}
            </h1>
            {product.descricao && (
              <p className="text-on-surface-variant text-lg leading-relaxed font-body">
                {product.descricao}
              </p>
            )}
          </header>

          {/* Pricing & Expiration */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex flex-col">
                {product.precoOriginal !== product.precoDesconto && (
                  <span className="text-on-surface-variant line-through text-lg">
                    R$ {product.precoOriginal.toFixed(2)}
                  </span>
                )}
                <span className="text-5xl font-headline font-black text-on-tertiary-fixed-variant tracking-tighter">
                  R$ {product.precoDesconto.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-bold mb-2">
                  {discount}% OFF
                </span>
              )}
            </div>

            {product.dataValidade && (
              <div className="flex items-center gap-3 p-4 bg-error-container/30 rounded-lg border border-error/10">
                <span className="material-symbols-outlined text-error">event</span>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Data de Validade</p>
                  <p className="text-error font-headline font-extrabold text-xl">
                    {new Date(product.dataValidade).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <button 
              onClick={handleWhatsAppClick}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-6 rounded-full font-headline font-bold text-xl flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              Comprar via WhatsApp
            </button>
            <p className="text-center text-xs text-on-surface-variant font-medium">
              Fale diretamente com um farmacêutico curador
            </p>
          </div>

          {/* 👇 NOVA SEÇÃO: Local de Retirada (Farmácia) */}
          {product.farmacia && (
            <div className="space-y-4">
              <h3 className="text-tertiary font-headline font-bold text-sm uppercase tracking-widest border-b border-outline-variant/20 pb-2">
                Local de Retirada
              </h3>
              <MapaFarmacia farmacia={product.farmacia} />
            </div>
          )}

          {/* Trust Section */}
          <div className="pt-8 space-y-6">
            <h3 className="text-tertiary font-headline font-bold text-sm uppercase tracking-widest border-b border-outline-variant/20 pb-2">
              Trust & Safety
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary-container/20 p-3 rounded-full">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-tertiary">Farmácias verificadas</h4>
                  <p className="text-xs text-on-surface-variant">Rede credenciada e auditada</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary-container/20 p-3 rounded-full">
                  <span className="material-symbols-outlined text-primary">shield</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-tertiary">Compra segura</h4>
                  <p className="text-xs text-on-surface-variant">Dados protegidos de ponta a ponta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProductDetail
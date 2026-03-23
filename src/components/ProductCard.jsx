import { Link } from 'react-router-dom'
import { WHATSAPP_LINK } from '../utils/constants'

const ProductCard = ({ product }) => {
  const isNearExpiry = () => {
    if (!product.dataValidade) return false
    const today = new Date()
    const expiry = new Date(product.dataValidade)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30
  }

  const calculateDiscount = () => {
    if (!product.precoOriginal || !product.precoDesconto) return 0
    return Math.round(((product.precoOriginal - product.precoDesconto) / product.precoOriginal) * 100)
  }

  const discount = calculateDiscount()
  const nearExpiry = isNearExpiry()
  const isLastUnits = product.status === 'ULTIMAS_UNIDADES'

  const handleWhatsAppClick = (e) => {
    e.preventDefault()
    window.open(WHATSAPP_LINK(product), '_blank')
  }

  return (
    <div className="group relative bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden">
        <img 
          alt={product.nome} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={product.imagemUrl ? `http://localhost:8080${product.imagemUrl}` : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop'}
        />
        
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-error text-white px-3 py-1 rounded-full text-xs font-bold">
            {discount}% OFF
          </div>
        )}
        
        <button 
          onClick={handleWhatsAppClick}
          className="absolute bottom-4 right-4 w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
        </button>
      </div>

      <div className="p-6 space-y-3">
        {(nearExpiry || isLastUnits) && (
          <div className="flex gap-2">
            {nearExpiry && (
              <span className="px-2 py-0.5 rounded bg-primary-fixed/30 text-[10px] font-bold text-on-primary-fixed-variant">
                ⏳ Vence em breve
              </span>
            )}
            {isLastUnits && (
              <span className="px-2 py-0.5 rounded bg-error-container/40 text-on-error-container text-[10px] font-bold">
                🔥 Últimas unidades
              </span>
            )}
          </div>
        )}

        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-bold font-headline leading-tight hover:text-primary transition-colors">
            {product.nome}
          </h3>
        </Link>

        {product.descricao && (
          <p className="text-sm text-on-surface-variant line-clamp-2">
            {product.descricao}
          </p>
        )}

        <div className="pt-2">
          {product.precoOriginal !== product.precoDesconto && (
            <span className="text-on-surface-variant line-through text-sm">
              R$ {product.precoOriginal.toFixed(2)}
            </span>
          )}
          <div className="text-2xl font-bold text-primary font-headline">
            R$ {product.precoDesconto.toFixed(2)}
          </div>
        </div>

        {product.dataValidade && (
          <div className="text-xs text-on-surface-variant">
            Validade: {new Date(product.dataValidade).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
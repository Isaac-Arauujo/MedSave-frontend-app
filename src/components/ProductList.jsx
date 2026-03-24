import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import LoadingSpinner from './LoadingSpinner'
import { getProducts } from '../api/axios'
import { calcularDistancia, formatarDistancia } from '../services/location'
import { useUserLocation } from '../hooks/useUserLocation'

const ProductList = ({ filters = {} }) => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation } = useUserLocation()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, filters, userLocation])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar produtos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...products]

    if (filters.search) {
      const term = filters.search.toLowerCase()
      result = result.filter(p => 
        p.nome?.toLowerCase().includes(term) || 
        p.descricao?.toLowerCase().includes(term)
      )
    }

    if (filters.filter === 'nearby') {
      if (userLocation) {
        result = result
          .filter(p => p.farmacia?.latitude && p.farmacia?.longitude)
          .map(p => ({
            ...p,
            distancia: calcularDistancia(
              userLocation.latitude,
              userLocation.longitude,
              p.farmacia.latitude,
              p.farmacia.longitude
            )
          }))
          .sort((a, b) => a.distancia - b.distancia)
      } else {
        requestLocation()
      }
    }

    if (filters.filter === 'cheapest') {
      result.sort((a, b) => (a.precoDesconto || a.precoOriginal) - (b.precoDesconto || b.precoOriginal))
    }
    
    if (filters.filter === 'nearExpiry') {
      result.sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade))
    }
    
    if (filters.filter === 'biggestDiscount') {
      result.sort((a, b) => {
        const descA = a.precoOriginal ? (a.precoOriginal - (a.precoDesconto || a.precoOriginal)) / a.precoOriginal : 0
        const descB = b.precoOriginal ? (b.precoOriginal - (b.precoDesconto || b.precoOriginal)) / b.precoOriginal : 0
        return descB - descA
      })
    }

    setFilteredProducts(result)
  }

  if (loading || locationLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-8 md:py-12">
        <p className="text-red-500 text-sm md:text-base">{error}</p>
        <button onClick={fetchProducts} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-full text-sm">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <p className="text-gray-500 text-sm md:text-base">Nenhum produto encontrado</p>
      </div>
    )
  }

  return (
    <div>
      {filters.filter === 'nearby' && userLocation && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-700 flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">location_on</span>
            Mostrando farmácias próximas à sua localização
          </span>
          <button onClick={requestLocation} className="text-xs bg-white px-3 py-1 rounded-full shadow-sm hover:shadow">
            Atualizar
          </button>
        </div>
      )}
      
      {/* Grid responsivo: 2 colunas mobile, 3 tablets, 4 desktops */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="relative">
            {product.distancia && (
              <div className="absolute top-1 right-1 z-10 bg-white/90 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-green-600 shadow-sm">
                {formatarDistancia(product.distancia)}
              </div>
            )}
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList
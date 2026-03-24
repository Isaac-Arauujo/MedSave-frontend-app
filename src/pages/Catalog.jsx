import { useState } from 'react'
import ProductList from '../components/ProductList'
import SearchFilters from '../components/SearchFilters'
import { useUserLocation } from '../hooks/useUserLocation'

const Catalog = () => {
  const [filters, setFilters] = useState({
    search: '',
    filter: ''
  })
  const [activeFilter, setActiveFilter] = useState('')
  const { requestLocation } = useUserLocation()

  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, search: term }))
  }

  const handleFilter = (filterType) => {
    setActiveFilter(filterType)
    setFilters(prev => ({ ...prev, filter: filterType }))
  }

  const handleLocationRequest = () => {
    requestLocation()
    if (activeFilter === 'nearby') {
      setFilters(prev => ({ ...prev, filter: 'nearby' }))
    }
  }

  return (
    <main className="pt-24 md:pt-28 pb-12 md:pb-20">
      {/* Hero Section do Catálogo */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold text-[#2f56c3] mb-3 md:mb-4">
              Catálogo de Medicamentos
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Encontre os melhores preços perto de você. Economize enquanto cuida do planeta.
            </p>
          </div>
        </div>
      </section>

      {/* Barra de busca e filtros integrados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 -mt-6 md:-mt-8 relative z-30">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg space-y-4">
          {/* Campo de busca */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
            </div>
            <input 
              className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
              placeholder="Busque por medicamento, sintoma ou princípio ativo..." 
              type="text"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => handleFilter('nearby')}
              className={`px-3 py-1.5 rounded-full border text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${
                activeFilter === 'nearby'
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 hover:border-green-600 hover:text-green-600 bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">near_me</span>
              <span className="hidden sm:inline">Perto de você</span>
              <span className="sm:hidden">Perto</span>
            </button>
            <button
              onClick={() => handleFilter('cheapest')}
              className={`px-3 py-1.5 rounded-full border text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${
                activeFilter === 'cheapest'
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 hover:border-green-600 hover:text-green-600 bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">attach_money</span>
              <span className="hidden sm:inline">Mais baratos</span>
              <span className="sm:hidden">Barato</span>
            </button>
            <button
              onClick={() => handleFilter('nearExpiry')}
              className={`px-3 py-1.5 rounded-full border text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${
                activeFilter === 'nearExpiry'
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 hover:border-green-600 hover:text-green-600 bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">timer</span>
              <span className="hidden sm:inline">Próximos do vencimento</span>
              <span className="sm:hidden">Vence</span>
            </button>
            <button
              onClick={() => handleFilter('biggestDiscount')}
              className={`px-3 py-1.5 rounded-full border text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${
                activeFilter === 'biggestDiscount'
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 hover:border-green-600 hover:text-green-600 bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">percent</span>
              <span className="hidden sm:inline">Maior desconto</span>
              <span className="sm:hidden">Desc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <ProductList filters={filters} />

        {/* Load More */}
        <div className="mt-8 md:mt-12 lg:mt-20 flex justify-center">
          <button className="px-6 md:px-10 py-3 md:py-4 border border-gray-300 text-green-600 font-bold rounded-full text-sm md:text-base hover:bg-gray-50 transition-all active:scale-95">
            Carregar mais medicamentos
          </button>
        </div>
      </section>
    </main>
  )
}

export default Catalog
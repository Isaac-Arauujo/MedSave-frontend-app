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
    <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 lg:px-8">
      {/* Search & Filter Hero Section */}
      <section className="mb-16">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-tertiary mb-4">
              Catálogo de Medicamentos
            </h1>
            <p className="text-body text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Encontre os melhores preços perto de você. Economize enquanto cuida do planeta.
            </p>
          </div>
          
          {/* Barra de busca */}
          <div className="relative w-full max-w-3xl">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              className="w-full bg-surface-container-low border-none rounded-lg py-5 pl-14 pr-6 text-on-surface focus:ring-2 focus:ring-primary transition-all placeholder:text-outline/60" 
              placeholder="Busque por medicamento, sintoma ou princípio ativo..." 
              type="text"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Botões de filtro */}
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-label font-semibold text-tertiary uppercase tracking-wider text-xs mr-2">
              Filtrar por:
            </span>
            <button 
              onClick={() => handleFilter('nearby')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all active:scale-95 flex items-center gap-2 ${
                activeFilter === 'nearby' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container-highest text-on-surface hover:bg-primary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">near_me</span>
              Perto de você
            </button>
            <button 
              onClick={() => handleFilter('cheapest')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all active:scale-95 flex items-center gap-2 ${
                activeFilter === 'cheapest' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container-highest text-on-surface hover:bg-primary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">attach_money</span>
              Mais baratos
            </button>
            <button 
              onClick={() => handleFilter('nearExpiry')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all active:scale-95 flex items-center gap-2 ${
                activeFilter === 'nearExpiry' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container-highest text-on-surface hover:bg-primary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">timer</span>
              Próximos do vencimento
            </button>
            <button 
              onClick={() => handleFilter('biggestDiscount')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all active:scale-95 flex items-center gap-2 ${
                activeFilter === 'biggestDiscount' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container-highest text-on-surface hover:bg-primary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">percent</span>
              Maior desconto
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid com filtros aplicados */}
      <ProductList filters={filters} />

      {/* Load More */}
      <div className="mt-20 flex justify-center">
        <button className="px-10 py-4 border border-outline-variant/20 text-primary font-bold rounded-full hover:bg-surface-container-low transition-all active:scale-95">
          Carregar mais medicamentos
        </button>
      </div>
    </main>
  )
}

export default Catalog
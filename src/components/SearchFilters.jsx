import { useState } from 'react'

const SearchFilters = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const filters = [
    { id: 'nearby', label: 'Perto de você', icon: 'near_me' },
    { id: 'cheapest', label: 'Mais baratos', icon: 'attach_money' },
    { id: 'nearExpiry', label: 'Próximos do vencimento', icon: 'timer' },
    { id: 'biggestDiscount', label: 'Maior desconto', icon: 'percent' },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleFilterClick = (filterId) => {
    const newFilter = activeFilter === filterId ? '' : filterId
    setActiveFilter(newFilter)
    onFilter(newFilter)
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 -mt-6 md:-mt-16 relative z-30">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
              placeholder="Busque seu medicamento..."
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={`px-3 py-1.5 rounded-full border text-xs md:text-sm font-medium transition-all flex items-center gap-1 ${
                activeFilter === filter.id
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 hover:border-green-600 hover:text-green-600 bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{filter.icon}</span>
              <span className="hidden sm:inline">{filter.label}</span>
              <span className="sm:hidden">
                {filter.id === 'nearby' ? 'Perto' : 
                 filter.id === 'cheapest' ? 'Barato' :
                 filter.id === 'nearExpiry' ? 'Vence' : 'Desc'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SearchFilters
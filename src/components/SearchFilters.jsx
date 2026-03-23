import { useState } from 'react';

const SearchFilters = ({ onSearch, onFilter, activeFilter, onLocationRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filters = [
    { id: 'nearby', label: 'Perto de você', icon: 'near_me' },
    { id: 'cheapest', label: 'Mais baratos', icon: 'attach_money' },
    { id: 'nearExpiry', label: 'Próximos do vencimento', icon: 'timer' },
    { id: 'biggestDiscount', label: 'Maior desconto', icon: 'percent' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterClick = (filterId) => {
    if (filterId === 'nearby') {
      // Se clicou em "Perto de você", pede localização
      onLocationRequest();
    }
    onFilter(filterId);
  };

  return (
    <section className="max-w-7xl mx-auto px-8 -mt-16 relative z-30">
      <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] space-y-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-outline"
              placeholder="Busque seu medicamento..."
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-on-primary px-12 py-4 rounded-md font-bold hover:bg-secondary transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={`px-5 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                activeFilter === filter.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-outline-variant/30 hover:border-primary hover:text-primary bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
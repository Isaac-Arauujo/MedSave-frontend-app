import { useState } from 'react';
import HeroSection from '../components/HeroSection';
import SearchFilters from '../components/SearchFilters';
import ProductList from '../components/ProductList';
import { useUserLocation } from '../hooks/useUserLocation';

const Home = () => {
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState('');
  const { requestLocation } = useUserLocation();

  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, search: term }));
  };

  const handleFilter = (filterType) => {
    setActiveFilter(filterType);
    setFilters(prev => ({ ...prev, filter: filterType }));
  };

  const handleLocationRequest = () => {
    requestLocation();
    // Se já estava no filtro nearby, mantém
    if (activeFilter === 'nearby') {
      setFilters(prev => ({ ...prev, filter: 'nearby' }));
    }
  };

  return (
    <>
      <HeroSection />
      <SearchFilters 
        onSearch={handleSearch} 
        onFilter={handleFilter}
        activeFilter={activeFilter}
        onLocationRequest={handleLocationRequest}
      />
      
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-headline font-bold text-tertiary mb-2">
              Ofertas em Destaque
            </h2>
            <p className="text-on-surface-variant">
              Economia imediata para você e para o meio ambiente.
            </p>
          </div>
          <a 
            href="/catalog" 
            className="text-primary font-bold flex items-center gap-2 hover:underline underline-offset-4 decoration-2"
          >
            Ver todo o catálogo 
            <span className="material-symbols-outlined">arrow_right_alt</span>
          </a>
        </div>

        <ProductList filters={filters} />
      </section>

      {/* Resto do seu código (Eco Section, How it Works, etc) */}
      {/* ... */}
    </>
  );
};

export default Home;
import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { getProducts } from '../api/axios';
import { calcularDistancia, formatarDistancia } from '../services/location';
import { useUserLocation } from '../hooks/useUserLocation';

const ProductList = ({ filters = {}, onLocationLoading }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation } = useUserLocation();

  // Carregar produtos
  useEffect(() => {
    fetchProducts();
  }, []);

  // Aplicar filtros quando algo mudar
  useEffect(() => {
    applyFilters();
  }, [products, filters, userLocation]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    // 1. FILTRO DE BUSCA
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(p => 
        p.nome?.toLowerCase().includes(term) || 
        p.descricao?.toLowerCase().includes(term)
      );
    }

    // 2. FILTRO "PERTO DE VOCÊ" - COMPLETO
    if (filters.filter === 'nearby') {
      if (userLocation) {
        console.log('📍 SUA LOCALIZAÇÃO:', userLocation);
        
        const produtosComDistancia = [];
        const produtosSemCoordenadas = [];

        result.forEach((produto, index) => {
          console.log(`📦 Produto ${index + 1}:`, {
            nome: produto.nome,
            temFarmacia: !!produto.farmacia,
            farmacia: produto.farmacia,
            latitude: produto.farmacia?.latitude,
            longitude: produto.farmacia?.longitude
          });

          if (produto.farmacia?.latitude && produto.farmacia?.longitude) {
            const distancia = calcularDistancia(
              userLocation.latitude,
              userLocation.longitude,
              produto.farmacia.latitude,
              produto.farmacia.longitude
            );
            
            console.log(`📏 Distância calculada para ${produto.nome}:`, distancia);
            
            produtosComDistancia.push({
              ...produto,
              distancia: distancia
            });
          } else {
            console.log(`❌ ${produto.nome} sem coordenadas`);
            produtosSemCoordenadas.push(produto);
          }
        });

        // Ordenar por distância
        produtosComDistancia.sort((a, b) => a.distancia - b.distancia);
        
        console.log('📍 Produtos COM distância:', produtosComDistancia.map(p => ({
          nome: p.nome,
          distancia: p.distancia,
          farmacia: p.farmacia?.nome
        })));
        
        console.log('📍 Produtos SEM coordenadas:', produtosSemCoordenadas.map(p => p.nome));
        
        // JUNTAR TUDO: primeiro os com distância, depois os sem
        result = [...produtosComDistancia, ...produtosSemCoordenadas];
      } else {
        requestLocation();
        console.log('⏳ Aguardando localização...');
      }
    }

    // 3. OUTROS FILTROS
    if (filters.filter === 'cheapest') {
      result.sort((a, b) => (a.precoDesconto || a.precoOriginal) - (b.precoDesconto || b.precoOriginal));
    }
    
    if (filters.filter === 'nearExpiry') {
      result.sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade));
    }
    
    if (filters.filter === 'biggestDiscount') {
      result.sort((a, b) => {
        const descA = a.precoOriginal ? (a.precoOriginal - (a.precoDesconto || a.precoOriginal)) / a.precoOriginal : 0;
        const descB = b.precoOriginal ? (b.precoOriginal - (b.precoDesconto || b.precoOriginal)) / b.precoOriginal : 0;
        return descB - descA;
      });
    }

    setFilteredProducts(result);
  };

  // Função para forçar atualização da localização
  const handleLocationRequest = () => {
    requestLocation();
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error">{error}</p>
        <button onClick={fetchProducts} className="mt-4 px-6 py-2 bg-primary text-white rounded-full">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Status da localização */}
      {filters.filter === 'nearby' && (
        <div className="mb-6 p-4 bg-surface-container-low rounded-lg">
          {locationLoading ? (
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
              <span>Obtendo sua localização...</span>
            </div>
          ) : locationError ? (
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined">error</span>
              <span>{locationError}</span>
              <button
                onClick={handleLocationRequest}
                className="ml-4 px-4 py-1 bg-primary text-white rounded-full text-sm"
              >
                Tentar novamente
              </button>
            </div>
          ) : userLocation ? (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">location_on</span>
                <span>
                  Mostrando {filteredProducts.filter(p => p.distancia).length} produtos próximos
                  {filteredProducts.filter(p => !p.distancia).length > 0 && 
                    ` (${filteredProducts.filter(p => !p.distancia).length} sem localização)`}
                </span>
              </div>
              <button
                onClick={handleLocationRequest}
                className="px-4 py-1 bg-primary text-white rounded-full text-sm"
                title="Atualizar localização"
              >
                Atualizar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-warning">
              <span className="material-symbols-outlined">location_off</span>
              <span>Clique no botão "Perto de você" para ativar</span>
            </div>
          )}
        </div>
      )}

      {/* Lista de produtos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-on-surface-variant">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div>
          {/* Contador de produtos */}
          <div className="mb-4 text-sm text-on-surface-variant">
            Total: {filteredProducts.length} produtos
            {filters.filter === 'nearby' && userLocation && (
              <span className="ml-2">
                (📍 {filteredProducts.filter(p => p.distancia).length} com distância calculada)
              </span>
            )}
          </div>

          {/* Grid de produtos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative">
                {product.distancia && (
                  <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {formatarDistancia(product.distancia)}
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug no console */}
      {process.env.NODE_ENV === 'development' && (
        <div className="hidden">
          {console.log('📍 USER LOCATION:', userLocation)}
          {console.log('📍 TOTAL PRODUTOS:', filteredProducts.length)}
          {console.log('📍 PRODUTOS COM DISTÂNCIA:', filteredProducts.filter(p => p.distancia).length)}
          {console.log('📍 PRODUTOS SEM DISTÂNCIA:', filteredProducts.filter(p => !p.distancia).length)}
        </div>
      )}
    </div>
  );
};

export default ProductList;
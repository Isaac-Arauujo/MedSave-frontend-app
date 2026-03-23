const MapaFarmacia = ({ farmacia }) => {
  const handleOpenMaps = () => {
    if (farmacia.googleMapsUrl) {
      window.open(farmacia.googleMapsUrl, '_blank');
    } else if (farmacia.latitude && farmacia.longitude) {
      window.open(`https://www.google.com/maps?q=${farmacia.latitude},${farmacia.longitude}`, '_blank');
    } else {
      const endereco = encodeURIComponent(`${farmacia.endereco}${farmacia.numero ? ', ' + farmacia.numero : ''}, ${farmacia.cidade} - ${farmacia.estado}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${endereco}`, '_blank');
    }
  };

   return (
    <div className="bg-surface-container-low rounded-lg overflow-hidden">
      {/* Imagem genérica de farmácia em vez do mapa */}
      <div className="h-40 w-full relative cursor-pointer group" onClick={handleOpenMaps}>
        <img 
          src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop"
          alt="Farmácia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="bg-white/90 rounded-full px-4 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-primary">map</span>
            <span className="text-primary font-medium">Ver no mapa</span>
          </div>
        </div>
      </div>
      
      {/* Informações da farmácia */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary">store</span>
          <div className="flex-1">
            <h4 className="font-bold text-tertiary text-lg">{farmacia?.nome}</h4>
            
            <div className="mt-3 space-y-2">
              <p className="text-sm text-on-surface-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-base mt-0.5">location_on</span>
                <span>
                  {farmacia?.endereco}{farmacia?.numero && `, ${farmacia.numero}`}<br />
                  {farmacia?.bairro && <>{farmacia.bairro}<br /></>}
                  {farmacia?.cidade} - {farmacia?.estado}<br />
                  CEP: {farmacia?.cep}
                </span>
              </p>
              
              {farmacia?.telefone && (
                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">call</span>
                  <a href={`tel:${farmacia.telefone}`} className="hover:text-primary">
                    {farmacia.telefone}
                  </a>
                </p>
              )}
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleOpenMaps}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">map</span>
                Abrir no Maps
              </button>
              
              {farmacia?.telefone && (
                <a
                  href={`tel:${farmacia.telefone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-full text-sm hover:bg-primary/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  Ligar
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaFarmacia;
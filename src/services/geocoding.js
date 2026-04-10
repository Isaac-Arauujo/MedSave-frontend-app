import axios from 'axios';

export const buscarCoordenadasPorEndereco = async (enderecoCompleto) => {
  try {
    if (!enderecoCompleto || enderecoCompleto.trim() === '') {
      return null;
    }

    const enderecoLimpo = enderecoCompleto.trim();

    const url = 'https://nominatim.openstreetmap.org/search';
    
    const response = await axios.get(url, {
      params: {
        q: enderecoLimpo,
        format: 'json',
        limit: 1,
        'accept-language': 'pt'
      },
      headers: {
        'User-Agent': 'MedSave-App/1.0',
        'Accept': 'application/json'
      }
    });

    if (response.data && response.data.length > 0) {
      const primeiro = response.data[0];
      
      return {
        latitude: parseFloat(primeiro.lat),
        longitude: parseFloat(primeiro.lon)
      };
    } else {
      const enderecoSimples = enderecoLimpo.split(',')[0];
      
      const response2 = await axios.get(url, {
        params: {
          q: enderecoSimples,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'MedSave-App/1.0'
        }
      });
      
      if (response2.data && response2.data.length > 0) {
        return {
          latitude: parseFloat(response2.data[0].lat),
          longitude: parseFloat(response2.data[0].lon)
        };
      }
    }
    
    return null;
    
  } catch (error) {
    return null;
  }
};

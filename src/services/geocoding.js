import axios from 'axios';

export const buscarCoordenadasPorEndereco = async (enderecoCompleto) => {
  try {
    console.log('🔍 ===== INÍCIO DA BUSCA =====');
    console.log('📦 Endereço recebido:', enderecoCompleto);
    
    // Verificar se o endereço não está vazio
    if (!enderecoCompleto || enderecoCompleto.trim() === '') {
      console.log('❌ Endereço vazio');
      return null;
    }

    // Limpar o endereço
    const enderecoLimpo = enderecoCompleto.trim();
    console.log('🧹 Endereço limpo:', enderecoLimpo);

    // Fazer a requisição
    const url = 'https://nominatim.openstreetmap.org/search';
    console.log('📡 URL:', url);
    
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

    console.log('📥 Status da resposta:', response.status);
    console.log('📥 Dados brutos:', response.data);

    if (response.data && response.data.length > 0) {
      const primeiro = response.data[0];
      console.log('✅ Primeiro resultado:', primeiro);
      
      const coordenadas = {
        latitude: parseFloat(primeiro.lat),
        longitude: parseFloat(primeiro.lon)
      };
      
      console.log('🎯 Coordenadas extraídas:', coordenadas);
      return coordenadas;
    } else {
      console.log('⚠️ Nenhum resultado encontrado');
      
      // Tentar com um formato mais simples
      console.log('🔄 Tentando com formato simplificado...');
      const enderecoSimples = enderecoLimpo.split(',')[0]; // Pega só a primeira parte
      console.log('📦 Endereço simplificado:', enderecoSimples);
      
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
        const coordenadas = {
          latitude: parseFloat(response2.data[0].lat),
          longitude: parseFloat(response2.data[0].lon)
        };
        console.log('✅ Encontrado com formato simplificado:', coordenadas);
        return coordenadas;
      }
    }
    
    console.log('❌ Nenhuma coordenada encontrada após todas tentativas');
    return null;
    
  } catch (error) {
    console.error('❌ Erro detalhado:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return null;
  } finally {
    console.log('🔍 ===== FIM DA BUSCA =====');
  }
};
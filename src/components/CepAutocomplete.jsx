import { useState } from 'react';
import { buscarCep as buscarCepApi } from '../api/axios';

const CepAutocomplete = ({ onCepFound }) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buscarCep = async () => {
    if (!cep || cep.replace(/\D/g, '').length < 8) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await buscarCepApi(cep);
      
      if (response && !response.erro) {
        onCepFound({
          cep: response.cep,
          endereco: response.logradouro,
          bairro: response.bairro,
          cidade: response.localidade,
          estado: response.uf,
          complemento: response.complemento
        });
        setError('');
      } else {
        setError('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setError('Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    }
    setCep(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarCep();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-on-surface">
        CEP <span className="text-error">*</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={handleCepChange}
          onKeyPress={handleKeyPress}
          placeholder="00000-000"
          maxLength="9"
          className="flex-1 px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={buscarCep}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 min-w-[100px]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Buscando...
            </span>
          ) : (
            'Buscar'
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
      <p className="text-xs text-outline">
        Digite o CEP e clique em "Buscar" para preencher automaticamente
      </p>
    </div>
  );
};

export default CepAutocomplete;

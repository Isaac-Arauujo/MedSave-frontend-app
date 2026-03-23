import { useState, useEffect } from 'react';
import axios from 'axios';
import CepAutocomplete from '../components/CepAutocomplete';
import LoadingSpinner from '../components/LoadingSpinner';
import { buscarCoordenadasPorEndereco } from '../services/geocoding';

const AdminFarmacias = () => {
  const [farmacias, setFarmacias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarmacia, setEditingFarmacia] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    telefone: '',
    latitude: '',
    longitude: '',
    googleMapsUrl: ''
  });

  useEffect(() => {
    carregarFarmacias();
  }, []);

  const carregarFarmacias = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/farmacias');
      setFarmacias(response.data);
    } catch (error) {
      console.error('Erro ao carregar farmácias:', error);
      alert('Erro ao carregar farmácias');
    } finally {
      setLoading(false);
    }
  };

  const handleCepFound = (data) => {
    setFormData(prev => ({
      ...prev,
      cep: data.cep || prev.cep,
      endereco: data.endereco || '',
      bairro: data.bairro || '',
      cidade: data.cidade || '',
      estado: data.estado || '',
      complemento: data.complemento || ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar campos obrigatórios
      if (!formData.nome || !formData.cep || !formData.endereco || !formData.cidade || !formData.estado) {
        alert('Preencha todos os campos obrigatórios: Nome, CEP, Endereço, Cidade e Estado');
        return;
      }

      // 👇 BUSCAR COORDENADAS AUTOMATICAMENTE (AGORA DENTRO DA FUNÇÃO)
      let latitude = formData.latitude;
      let longitude = formData.longitude;

      // Se não tiver latitude/longitude preenchidas, tenta buscar pelo endereço
      if (!latitude || !longitude) {
        const enderecoCompleto = `${formData.endereco}${formData.numero ? ', ' + formData.numero : ''}, ${formData.bairro ? formData.bairro + ', ' : ''}${formData.cidade} - ${formData.estado}`;
        
        const coordenadas = await buscarCoordenadasPorEndereco(enderecoCompleto);
        if (coordenadas) {
          latitude = coordenadas.latitude;
          longitude = coordenadas.longitude;
        }
      }

      const farmaciaData = {
        nome: formData.nome.trim(),
        cep: formData.cep.trim(),
        endereco: formData.endereco.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim().toUpperCase(),
        numero: formData.numero?.trim() || null,
        complemento: formData.complemento?.trim() || null,
        bairro: formData.bairro?.trim() || null,
        telefone: formData.telefone?.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        googleMapsUrl: formData.googleMapsUrl?.trim() || null
      };

      console.log('📤 Enviando farmácia:', farmaciaData);

      if (editingFarmacia) {
        await axios.put(`http://localhost:8080/api/farmacias/${editingFarmacia.id}`, farmaciaData);
      } else {
        await axios.post('http://localhost:8080/api/farmacias', farmaciaData);
      }
      
      await carregarFarmacias();
      closeModal();
      alert('Farmácia salva com sucesso!');
    } catch (error) {
      console.error('❌ Erro completo:', error.response?.data);
      
      let errorMessage = 'Erro ao salvar farmácia';
      if (error.response?.data?.fieldErrors) {
        errorMessage = Object.entries(error.response.data.fieldErrors)
          .map(([campo, erro]) => `${campo}: ${erro}`)
          .join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta farmácia?')) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/farmacias/${id}`);
      await carregarFarmacias();
      alert('Farmácia deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar farmácia:', error.response?.data);
      
      let errorMessage = 'Erro ao deletar farmácia';
      if (error.response?.status === 500) {
        errorMessage = 'Não é possível deletar esta farmácia pois existem produtos vinculados a ela. Primeiro desvincule os produtos.';
      }
      
      alert(errorMessage);
    }
  };

  const openModal = (farmacia = null) => {
    if (farmacia) {
      setEditingFarmacia(farmacia);
      setFormData({
        nome: farmacia.nome || '',
        cep: farmacia.cep || '',
        endereco: farmacia.endereco || '',
        numero: farmacia.numero || '',
        complemento: farmacia.complemento || '',
        bairro: farmacia.bairro || '',
        cidade: farmacia.cidade || '',
        estado: farmacia.estado || '',
        telefone: farmacia.telefone || '',
        latitude: farmacia.latitude || '',
        longitude: farmacia.longitude || '',
        googleMapsUrl: farmacia.googleMapsUrl || ''
      });
    } else {
      setEditingFarmacia(null);
      setFormData({
        nome: '',
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        telefone: '',
        latitude: '',
        longitude: '',
        googleMapsUrl: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFarmacia(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-headline font-bold text-tertiary">Farmácias</h1>
            <p className="text-on-surface-variant">Gerencie as farmácias parceiras</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Nova Farmácia
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmacias.map(farmacia => (
            <div key={farmacia.id} className="bg-surface-container-lowest rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">store</span>
                <div className="flex-1">
                  <h3 className="font-bold text-tertiary">{farmacia.nome}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {farmacia.endereco}{farmacia.numero && `, ${farmacia.numero}`}
                  </p>
                  <p className="text-sm text-on-surface-variant">{farmacia.cidade} - {farmacia.estado}</p>
                  {farmacia.telefone && (
                    <p className="text-sm text-on-surface-variant mt-1">📞 {farmacia.telefone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-outline-variant/20">
                <button
                  onClick={() => openModal(farmacia)}
                  className="p-2 text-slate-400 hover:text-primary transition-colors"
                  title="Editar"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(farmacia.id)}
                  className="p-2 text-slate-400 hover:text-error transition-colors"
                  title="Deletar"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Farmácia */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-tertiary mb-6">
              {editingFarmacia ? 'Editar Farmácia' : 'Nova Farmácia'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Nome da Farmácia <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <CepAutocomplete onCepFound={handleCepFound} />

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Endereço <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Número</label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Complemento</label>
                  <input
                    type="text"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Cidade <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Estado <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                    maxLength="2"
                    placeholder="SP"
                    className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="11999999999"  
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">URL do Google Maps</label>
                <input
                  type="url"
                  name="googleMapsUrl"
                  value={formData.googleMapsUrl}
                  onChange={handleInputChange}
                  placeholder="https://goo.gl/maps/..."
                  className="w-full px-4 py-2 rounded-md border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 rounded-full border border-outline-variant/30 text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  {editingFarmacia ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFarmacias;
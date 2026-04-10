import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cadastrar } from '../api/axios';

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validações
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    
    if (formData.nome.trim().length < 3) {
      setError('Nome deve ter no mínimo 3 caracteres');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }
    
    if (!formData.password) {
      setError('Senha é obrigatória');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    setLoading(true);

    try {
      const result = await cadastrar({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      if (result.user) {
        // Login automático após cadastro
        await login(formData.email, formData.password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface pt-20">
      <div className="bg-surface-container-lowest rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-tertiary">MedSave</h1>
          <p className="text-on-surface-variant mt-2">Crie sua conta gratuitamente</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Nome completo
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Confirmar senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-on-surface-variant">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;

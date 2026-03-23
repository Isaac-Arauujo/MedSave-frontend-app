import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    console.error('❌ Erro na requisição:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    })
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH ====================
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    const { token, nome, email: userEmail, role, id } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({
      id,
      nome,
      email: userEmail,
      role
    }))
    
    return { user: { id, nome, email: userEmail, role }, token }
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao fazer login'
    throw new Error(message)
  }
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const isAuthenticated = () => {
  return !!getToken()
}

export const isAdmin = () => {
  const user = getCurrentUser()
  return user?.role === 'ADMIN'
}

// ==================== UPLOAD ====================
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// ==================== PRODUTOS (PÚBLICO) ====================
export const getProducts = async () => {
  const response = await api.get('/produtos')
  return response.data
}

// ==================== PRODUTOS (ADMIN) ====================
export const getAllProductsAdmin = async () => {
  const response = await api.get('/produtos/admin')
  return response.data
}

export const createProduct = async (productData) => {
  const response = await api.post('/produtos', productData)
  return response.data
}

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/produtos/${id}`, productData)
  return response.data
}

export const deleteProduct = async (id) => {
  const response = await api.delete(`/produtos/${id}`)
  return response.data
}

// ==================== FARMÁCIAS ====================
export const getFarmacias = async () => {
  const response = await api.get('/farmacias')
  return response.data
}

export const createFarmacia = async (farmaciaData) => {
  const response = await api.post('/farmacias', farmaciaData)
  return response.data
}

export const updateFarmacia = async (id, farmaciaData) => {
  const response = await api.put(`/farmacias/${id}`, farmaciaData)
  return response.data
}

export const deleteFarmacia = async (id) => {
  const response = await api.delete(`/farmacias/${id}`)
  return response.data
}

export const buscarCep = async (cep) => {
  const response = await api.get(`/farmacias/buscar-cep/${cep.replace(/\D/g, '')}`)
  return response.data
}

// ==================== CADASTRO ====================
export const cadastrar = async (userData) => {
  try {
    const response = await api.post('/auth/cadastrar', userData)
    const { token, nome, email: userEmail, role, id } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({
      id,
      nome,
      email: userEmail,
      role
    }))
    
    return { user: { id, nome, email: userEmail, role }, token }
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao cadastrar'
    throw new Error(message)
  }
}
export default api
const rawApiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080'

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '')
export const API_URL = `${API_BASE_URL}/api`

export const buildAssetUrl = (path) => {
  if (!path) {
    return null
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

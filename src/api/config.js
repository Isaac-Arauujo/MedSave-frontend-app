const rawApiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080'

const normalizedApiBaseUrl = /^https?:\/\//i.test(rawApiBaseUrl)
  ? rawApiBaseUrl
  : `https://${rawApiBaseUrl}`

export const API_BASE_URL = normalizedApiBaseUrl.replace(/\/$/, '')
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

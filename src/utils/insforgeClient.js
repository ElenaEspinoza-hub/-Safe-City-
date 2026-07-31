import { createClient } from '@insforge/sdk'

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
const baseUrl = (env.VITE_INSFORGE_URL ?? '').trim()
const anonKey = (env.VITE_INSFORGE_ANON_KEY ?? '').trim()

export const getInsforgeConfigError = (baseUrlValue = baseUrl, anonKeyValue = anonKey) => {
  const missing = []

  if (!baseUrlValue) {
    missing.push('VITE_INSFORGE_URL')
  }

  if (!anonKeyValue) {
    missing.push('VITE_INSFORGE_ANON_KEY')
  }

  if (missing.length) {
    return `Faltan variables de entorno de InsForge: ${missing.join(', ')}. Agregalas al archivo .env.local.`
  }

  return null
}

const configErrorMessage = getInsforgeConfigError()

if (configErrorMessage) {
  console.warn(configErrorMessage)
}

export const insforge = createClient({
  baseUrl,
  anonKey
})
